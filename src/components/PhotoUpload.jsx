import { useState, useRef } from 'react'
import { Camera, X, Plus } from 'lucide-react'
import { supabase } from '../supabase'
import { C, FONT_BODY } from '../constants'

export default function PhotoUpload({ photos, onChange }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  async function handleFile(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `waste/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('waste-images').upload(path, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('waste-images').getPublicUrl(path)
        uploaded.push(publicUrl)
      }
      onChange([...photos, ...uploaded])
    } catch (e) {
      alert('사진 업로드 실패: ' + e.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function remove(url) {
    onChange(photos.filter(p => p !== url))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {photos.map(url => (
          <div key={url} style={{ position: 'relative', width: 90, height: 90 }}>
            <img src={url} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.line}` }} />
            <button onClick={() => remove(url)} style={{
              position: 'absolute', top: -6, right: -6,
              width: 22, height: 22, borderRadius: '50%',
              background: '#e53e3e', color: '#fff', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            }}>
              <X size={12} />
            </button>
          </div>
        ))}

        {photos.length < 5 && (
          <button onClick={() => inputRef.current?.click()} style={{
            width: 90, height: 90, borderRadius: 8,
            border: `2px dashed ${C.line}`,
            background: C.faint, cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            {uploading
              ? <span style={{ fontSize: 11, color: '#80796A' }}>업로드중...</span>
              : <>
                  <Camera size={22} color={C.sage} />
                  <span style={{ fontSize: 11, color: '#80796A', fontFamily: FONT_BODY }}>사진 추가</span>
                </>
            }
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
      <p style={{ fontSize: 11, color: '#A39C8B', marginTop: 8 }}>사진은 최대 5장까지 등록 가능해요</p>
    </div>
  )
}
