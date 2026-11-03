import struct, json, io, numpy as np
from PIL import Image
CT={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def load(path):
    d=open(path,'rb').read(); off=12; J=None; B=None
    while off<len(d):
        cl,ct=struct.unpack('<II',d[off:off+8]); ch=d[off+8:off+8+cl]
        if ct==0x4E4F534A: J=json.loads(ch)
        elif ct==0x004E4942: B=ch
        off+=8+cl
    return J,B
def local(n):
    if 'matrix' in n: return np.array(n['matrix'],dtype=np.float64).reshape(4,4).T
    m=np.eye(4); t=n.get('translation',[0,0,0]); q=n.get('rotation',[0,0,0,1]); s=n.get('scale',[1,1,1]); x,y,z,w=q
    R=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
    m[:3,:3]=R@np.diag(s); m[:3,3]=t; return m
def read(J,B,ai):
    a=J['accessors'][ai]
    dt=np.dtype(CT[a['componentType']]); n=NC[a['type']]
    if 'bufferView' not in a: return np.zeros((a['count'],n))
    bv=J['bufferViews'][a['bufferView']]
    base=bv.get('byteOffset',0)+a.get('byteOffset',0); stride=bv.get('byteStride') or dt.itemsize*n
    if stride==dt.itemsize*n: arr=np.frombuffer(B,dtype=dt,count=a['count']*n,offset=base).reshape(a['count'],n).astype(np.float64)
    else:
        arr=np.empty((a['count'],n))
        for i in range(a['count']): arr[i]=np.frombuffer(B,dtype=dt,count=n,offset=base+i*stride)
    if a.get('normalized') and dt.kind in 'iu': arr=arr/np.iinfo(dt).max
    return arr
def image(J,B,i):
    im=J['images'][i]; bv=J['bufferViews'][im['bufferView']]
    return Image.open(io.BytesIO(B[bv.get('byteOffset',0):bv.get('byteOffset',0)+bv['byteLength']]))
def extract(path):
    """Bake node transforms. Returns dict mat_index -> dict(pos,nor,uv(base),uvn(normal),idx) and J,B"""
    J,B=load(path); inst=[]
    def walk(ni,par):
        n=J['nodes'][ni]; w=par@local(n)
        if 'mesh' in n: inst.append((n['mesh'],w))
        for c in n.get('children',[]): walk(c,w)
    for r in J['scenes'][J.get('scene',0)]['nodes']: walk(r,np.eye(4))
    out={}
    for mi,w in inst:
        for p in J['meshes'][mi]['primitives']:
            if p.get('mode',4)!=4: continue
            at=p['attributes']; m=p.get('material',0); mat=J['materials'][m]
            pos=read(J,B,at['POSITION']); n=len(pos)
            nor=read(J,B,at['NORMAL']) if 'NORMAL' in at else None
            idx=read(J,B,p['indices']).reshape(-1).astype(np.int64) if 'indices' in p else np.arange(n)
            pos=(np.c_[pos,np.ones(n)]@w.T)[:,:3]
            if nor is not None:
                nm=np.linalg.inv(w[:3,:3]).T; nor=nor@nm.T; nor/=np.maximum(np.linalg.norm(nor,axis=1,keepdims=True),1e-12)
            pb=mat.get('pbrMetallicRoughness',{})
            tc=pb.get('baseColorTexture',{}).get('texCoord',0); tn=mat.get('normalTexture',{}).get('texCoord',0)
            uv=read(J,B,at[f'TEXCOORD_{tc}']) if f'TEXCOORD_{tc}' in at else None
            uvn=read(J,B,at[f'TEXCOORD_{tn}']) if f'TEXCOORD_{tn}' in at else None
            e=out.setdefault(m,{'pos':[],'nor':[],'uv':[],'uvn':[],'idx':[],'off':0})
            e['pos'].append(pos); e['nor'].append(nor); e['uv'].append(uv); e['uvn'].append(uvn); e['idx'].append(idx+e['off']); e['off']+=n
    return out,J,B
