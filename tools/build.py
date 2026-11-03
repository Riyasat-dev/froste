import sys, io, json, struct, numpy as np
from lib import *
from PIL import Image
UP='/mnt/user-data/uploads/'; OUT='/home/claude/p/vite/froste/public/models/'
W_TARGET=2.3; SHOULDER_Y=-0.62; BOTTOM_MIN=-3.3

CFG={
 'puffer-01':dict(src='puffer_jacket',mode='strip',py=1.58,rough=0.45,tris=36000),
 'puffer-02':dict(src='purpal_puffer_jacket_low_poly',py=1.52,rough=0.5,tris=34000,
                  droop=dict(cx=0,px=0.2,py=1.52,blend=0.1,cur=(53,53),target=82)),
 'puffer-03':dict(src='puffer_scan_medpoly',py=-0.12,rough=0.5,tris=9000,
                  droop=dict(cx=5.70,px=0.2,py=-0.12,blend=0.1,cur=(21,36),target=82)),
 'coat-01':dict(src='coat_leather_jacket_3d_model_free',py=0.9,rough=0.6,tris=18000),
 'coat-02':dict(src='female_overcoat',py=1.56,rough=0.95,tris=14000,
                droop=dict(cx=0,px=0.19,py=1.55,blend=0.1,cur=(53,53),target=80)),
 'hoodie-01':dict(src='oversized_sweater',py=1.5,rough=0.95,tris=30000,
                droop=dict(cx=0,px=0.3,py=1.48,blend=0.12,cur=(51,51),target=76)),
 'hoodie-02':dict(src='sweater',py=0.62,rough=0.95,tris=30000,
                droop=dict(cx=0,px=0.18,py=0.6,blend=0.1,cur=(57,57),target=78)),
}
STRIP_ROLES=[('nylon','body'),('rib','trim'),('fabric','tape')]

def smooth(t): t=np.clip(t,0,1); return t*t*(3-2*t)
def droop(pos,nor,d):
    cx,px,py,blend=d['cx'],d['px'],d['py'],d['blend']; tgt=np.radians(d['target'])
    for side,cur in ((-1,d['cur'][0]),(1,d['cur'][1])):
        s=side*(pos[:,0]-cx); dx=s-px; dy=pos[:,1]-py
        phi=np.degrees(np.arctan2(-dy,np.maximum(dx,1e-6)))         # angle below horizontal
        phimax=(cur+90)/2+8
        w=smooth((s-px+0.02)/blend)*smooth((phimax-phi)/18.0)*(dx>-0.02)
        delta=np.radians(1)*0+((tgt-np.radians(cur))*w)
        c,sn=np.cos(delta),np.sin(delta)
        nx=dx*c+dy*sn; ny=-dx*sn+dy*c
        m=w>0
        pos[m,0]=cx+side*(px+nx[m]); pos[m,1]=py+ny[m]
        a=side*nor[:,0]; na=a*c+nor[:,1]*sn; nb=-a*sn+nor[:,1]*c
        nor[m,0]=side*na[m]; nor[m,1]=nb[m]
    nor/=np.maximum(np.linalg.norm(nor,axis=1,keepdims=True),1e-12)

def decimate(pos,nor,uv,idx,target,uvcell=48):
    lo=pos.min(0); span=(pos.max(0)-lo).max()
    def run(g):
        k=np.floor((pos-lo)/g).astype(np.int64); key=(k[:,0]*4096+k[:,1])*4096+k[:,2]
        key=key*8+((nor[:,0]>0)*1+(nor[:,1]>0)*2+(nor[:,2]>0)*4)   # inner/outer cloth layers face opposite ways: never merge them
        if uv is not None:
            u=np.floor(np.mod(uv,1.0)*uvcell).astype(np.int64); key=key*4096+u[:,0]*64+u[:,1]
        _,inv=np.unique(key,return_inverse=True)
        t=inv[idx.reshape(-1,3)]
        ok=(t[:,0]!=t[:,1])&(t[:,1]!=t[:,2])&(t[:,0]!=t[:,2]); t=t[ok]
        _,first=np.unique(np.sort(t,axis=1),axis=0,return_index=True); t=t[np.sort(first)]
        return inv,t
    lo_g,hi_g=span/600,span/6; best=None; bd=1e18
    for _ in range(18):
        g=(lo_g*hi_g)**0.5; inv,t=run(g)
        d=abs(len(t)-target)
        if d<bd: bd=d; best=(inv,t)
        if d<target*0.04: break
        if len(t)>target: lo_g=g
        else: hi_g=g
    inv,t=best; nc=inv.max()+1; cnt=np.bincount(inv,minlength=nc).astype(float)
    P=np.stack([np.bincount(inv,weights=pos[:,i],minlength=nc) for i in range(3)],1)/cnt[:,None]
    N=np.stack([np.bincount(inv,weights=nor[:,i],minlength=nc) for i in range(3)],1); N/=np.maximum(np.linalg.norm(N,axis=1,keepdims=True),1e-12)
    UV=None if uv is None else np.stack([np.bincount(inv,weights=uv[:,i],minlength=nc) for i in range(2)],1)/cnt[:,None]
    used=np.unique(t); remap=np.full(nc,-1); remap[used]=np.arange(len(used))
    return P[used],N[used],(None if UV is None else UV[used]),remap[t].reshape(-1)

def sample_L(img,uv):
    a=np.array(img.convert('RGB')).astype(float); h,w=a.shape[:2]
    u=np.mod(uv[:,0],1.0); v=np.mod(uv[:,1],1.0)
    c=a[(v*(h-1)).astype(int),(u*(w-1)).astype(int)]; return c@np.array([0.299,0.587,0.114])
def normalise_tex(img,uv,tri_uv=None):
    """grey-scale map that keeps fabric detail but lets code tint it with the swatch colour.
    Unused atlas area is filled from the nearest used pixel so dark background never bleeds in at UV seams."""
    import cv2
    from scipy import ndimage
    L=np.array(img.convert('RGB')).astype(float)@np.array([0.299,0.587,0.114])
    s=sample_L(img,uv); med=np.median(s); std=max(s.std(),1.0)
    gain=np.clip(0.09*255/std,1.0,3.0)
    v=np.clip(0.88+(L-med)/255*gain,0.05,1.0)
    if tri_uv is not None:
        h,w=v.shape; mask=np.zeros((h,w),np.uint8)
        pts=np.stack([tri_uv[:,:,0]*(w-1),tri_uv[:,:,1]*(h-1)],-1).round().astype(np.int32)
        ok=(tri_uv.min(axis=(1,2))>=0)&(tri_uv.max(axis=(1,2))<=1)
        cv2.fillPoly(mask,list(pts[ok]),255)
        mask=cv2.dilate(mask,np.ones((3,3),np.uint8))>0
        _,(iy,ix)=ndimage.distance_transform_edt(~mask,return_indices=True)
        v=v[iy,ix]
    return Image.fromarray((v*255).astype(np.uint8)).resize((1024,1024)).convert('L').convert('RGB')
def jpg(img,q=86):
    b=io.BytesIO(); img.save(b,'JPEG',quality=q); return b.getvalue()

def build(name):
    c=CFG[name]; out,J,B=extract(UP+c['src']+'.glb')
    mats=J['materials']; strip=c.get('mode')=='strip'
    # concatenate everything for transforms
    items=[]  # (m, pos,nor,uv,uvn,idx)
    for m,e in out.items():
        pos=np.concatenate(e['pos']); idx=np.concatenate(e['idx'])
        nor=np.concatenate(e['nor']) if e['nor'][0] is not None else np.tile([0,0,1.],(len(pos),1))
        uv=np.concatenate(e['uv']) if e['uv'][0] is not None else None
        uvn=np.concatenate(e['uvn']) if e['uvn'][0] is not None else None
        items.append([m,pos,nor,uv,uvn,idx])
    if c.get('droop'):
        for it in items: droop(it[1],it[2],c['droop'])
    allp=np.concatenate([it[1] for it in items]); lo,hi=allp.min(0),allp.max(0)
    width=hi[0]-lo[0]; s=W_TARGET/width
    s=min(s,(SHOULDER_Y-BOTTOM_MIN)/max(c["py"]-lo[1],1e-6))
    ctr=np.array([(lo[0]+hi[0])/2,0,(lo[2]+hi[2])/2])
    def tf(p): q=(p-ctr)*s; q[:,1]=(p[:,1]-c['py'])*s+SHOULDER_Y; return q
    body_m=max(items,key=lambda it:len(it[5]))[0]
    groups={}  # merge by key
    for m,pos,nor,uv,uvn,idx in items:
        mat=mats[m]; pb=mat.get('pbrMetallicRoughness',{}); name_m=mat.get('name','')
        textured=('baseColorTexture' in pb) and uv is not None and not strip
        if strip:
            role=next((r for k,r in STRIP_ROLES if k in name_m.lower()),'metal'); key=('strip',role)
        elif textured:
            src=J['textures'][pb['baseColorTexture']['index']]['source']; role='body' if m==body_m else 'trim'; key=('tex',src,role)
        else:
            role='fixed'; key=('fixed',tuple(np.round(pb.get('baseColorFactor',[.8,.8,.8,1]),3)))
        g=groups.setdefault(key,{'role':role,'mat':mat,'parts':[],'textured':textured,'mat_idx':m})
        g['parts'].append((pos,nor,uv,uvn,idx))
    bin_=bytearray(); bvs=[]; accs=[]; prims=[]; outmats=[]; images=[]; textures=[]
    def addbv(b,target=None):
        while len(bin_)%4: bin_.append(0)
        e={'buffer':0,'byteOffset':len(bin_),'byteLength':len(b)}
        if target: e['target']=target
        bvs.append(e); bin_.extend(b); return len(bvs)-1
    imgcache={}
    total=0
    for key,g in groups.items():
        pos=np.concatenate([p[0] for p in g['parts']]); nor=np.concatenate([p[1] for p in g['parts']])
        uv=np.concatenate([p[2] for p in g['parts']]) if g['textured'] else None
        offs=np.cumsum([0]+[len(p[0]) for p in g['parts']])
        idx=np.concatenate([p[4]+offs[i] for i,p in enumerate(g['parts'])])
        ntri=len(idx)//3
        pos=tf(pos)
        if ntri>c['tris']*0.12:   # decimate only the big pieces; keep small hardware intact
            share=len(idx)/sum(len(i[5]) for i in items)
            tgt=int(c['tris']*share) if len(groups)>1 else c['tris']
            pos,nor,uv,idx=decimate(pos,nor,uv,idx,max(tgt,1500))
        total+=len(idx)//3
        pos=pos.astype(np.float32); nor=nor.astype(np.float32)
        idx=idx.astype(np.uint16 if len(pos)<65535 else np.uint32)
        a0=len(accs)
        accs.append({'bufferView':addbv(pos.tobytes(),34962),'componentType':5126,'count':len(pos),'type':'VEC3','min':pos.min(0).tolist(),'max':pos.max(0).tolist()})
        accs.append({'bufferView':addbv(nor.tobytes(),34962),'componentType':5126,'count':len(nor),'type':'VEC3'})
        at={'POSITION':a0,'NORMAL':a0+1}
        if g['textured']:
            uvf=uv.astype(np.float32); accs.append({'bufferView':addbv(uvf.tobytes(),34962),'componentType':5126,'count':len(uvf),'type':'VEC2'}); at['TEXCOORD_0']=len(accs)-1
        accs.append({'bufferView':addbv(idx.tobytes(),34963),'componentType':5125 if idx.dtype==np.uint32 else 5123,'count':len(idx),'type':'SCALAR'})
        mat=g['mat']; pb=mat.get('pbrMetallicRoughness',{}); role=g['role']
        om={'name':f"{role}_{len(outmats)}",'doubleSided':True,'extras':{'role':role,'rough':c['rough']}}
        pbr={'metallicFactor':0.0,'roughnessFactor':c['rough']}
        if role=='fixed':
            pbr['baseColorFactor']=pb.get('baseColorFactor',[.8,.8,.8,1]); om['extras']['rough']=0.5
        elif role=='metal':
            pbr['baseColorFactor']=[1,1,1,1]
        else: pbr['baseColorFactor']=[1,1,1,1]
        if g['textured']:
            src=J['textures'][pb['baseColorTexture']['index']]['source']
            if src not in imgcache:
                tri=np.concatenate([p[2][p[4].reshape(-1,3)] for p in g['parts']])
                nm=normalise_tex(image(J,B,src),np.concatenate([p[2] for p in g['parts']]),tri)
                images.append({'bufferView':addbv(jpg(nm,84)),'mimeType':'image/jpeg'}); textures.append({'source':len(images)-1})
                imgcache[src]=len(textures)-1
            pbr['baseColorTexture']={'index':imgcache[src]}
            nt=mat.get('normalTexture'); 
            if nt is not None and nt.get('texCoord',0)==pb['baseColorTexture'].get('texCoord',0):
                nsrc=J['textures'][nt['index']]['source']; ck=('n',nsrc)
                if ck not in imgcache:
                    ni=image(J,B,nsrc).convert('RGB').resize((1024,1024))
                    images.append({'bufferView':addbv(jpg(ni,88)),'mimeType':'image/jpeg'}); textures.append({'source':len(images)-1}); imgcache[ck]=len(textures)-1
                om['normalTexture']={'index':imgcache[ck],'scale':nt.get('scale',1.0)}
        om['pbrMetallicRoughness']=pbr; outmats.append(om)
        prims.append({'attributes':at,'indices':len(accs)-1,'material':len(outmats)-1})
    ex=J['asset'].get('extras',{})
    final=np.concatenate([tf(it[1].copy()) for it in items]); fl,fh=final.min(0),final.max(0)
    out={'asset':{'version':'2.0','generator':'froste build','copyright':f"{ex.get('title','')} by {ex.get('author','')} ({ex.get('license','')}) {ex.get('source','')}",
                  'extras':{'bottom':round(float(fl[1]),3),'halfWidth':round(float(max(abs(fl[0]),fh[0])),3),'title':ex.get('title'),'author':ex.get('author'),'source':ex.get('source'),'license':ex.get('license')}},
         'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':name}],'meshes':[{'name':name,'primitives':prims}],
         'materials':outmats,'accessors':accs,'bufferViews':bvs,'buffers':[{'byteLength':len(bin_)}]}
    if textures: out['textures']=textures; out['images']=images; out['samplers']=[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}]; [t.update({'sampler':0}) for t in out['textures']]
    js=json.dumps(out,separators=(',',':')).encode()
    while len(js)%4: js+=b' '
    while len(bin_)%4: bin_.append(0)
    glb=struct.pack('<4sII',b'glTF',2,12+8+len(js)+8+len(bin_))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(bin_),0x004E4942)+bytes(bin_)
    open(OUT+name+'.glb','wb').write(glb)
    print(f"{name:10s} tris={total:6d} size={len(glb)/1e6:5.2f}MB mats={len(outmats)} scale={s:.2f} bottom={fl[1]:.2f} halfW={max(abs(fl[0]),fh[0]):.2f} top={fh[1]:.2f}")
if __name__=='__main__':
    for n in (sys.argv[1:] or CFG): build(n)
