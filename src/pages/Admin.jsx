import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const today = () => new Date().toISOString().split('T')[0]

async function uploadImage(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('uploads').upload(path, file)
  if (error) throw error
  return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
}

async function uploadVideo(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('uploads').upload(path, file)
  if (error) throw error
  return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl
}

async function uploadAudio(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('music').upload(path, file)
  if (error) throw error
  return supabase.storage.from('music').getPublicUrl(path).data.publicUrl
}

// ── UI atoms ─────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-widest text-c-muted mb-1.5">{label}</span>
      {children}
    </label>
  )
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-c-accent/25 bg-c-bg3 text-c-text text-sm focus:border-c-accent2 outline-none transition-colors'

function Input({ label, ...p }) {
  return <Field label={label}><input {...p} className={inputCls} /></Field>
}
function Textarea({ label, ...p }) {
  return <Field label={label}><textarea {...p} className={`${inputCls} resize-y`} /></Field>
}
function Select({ label, children, ...p }) {
  return <Field label={label}><select {...p} className={inputCls}>{children}</select></Field>
}

function Btn({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-gradient-to-r from-c-accent to-c-accent2 text-white hover:opacity-90',
    outline:  'border border-c-accent/30 text-c-text hover:border-c-accent2',
    danger:   'bg-red-600 text-white hover:bg-red-500',
  }
  return (
    <button {...p} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${v[variant]} ${className}`} />
  )
}

function Badge({ published }) {
  return published
    ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Publicado</span>
    : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">Borrador</span>
}

function Toast({ msg, ok }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-xl border text-sm font-semibold shadow-xl ${ok ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'} bg-c-bg2`}>
      {msg}
    </div>
  )
}

function Modal({ title, onClose, footer, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-c-bg2 border border-c-accent/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-c-muted hover:text-c-text text-xl leading-none">✕</button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && <div className="px-6 pb-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

function ItemCard({ thumb, title, meta, published, onEdit, onDelete }) {
  return (
    <div className="flex gap-4 items-start bg-c-bg2 border border-c-accent/25 rounded-xl p-4">
      <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-c-bg3 flex items-center justify-center text-2xl">
        {typeof thumb === 'string' && thumb.startsWith('http')
          ? <img src={thumb} alt="" className="w-full h-full object-cover" />
          : thumb}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{title}</div>
        <div className="flex items-center gap-2 mt-1 text-xs text-c-muted flex-wrap">
          {meta}
          <Badge published={published} />
        </div>
        <div className="flex gap-2 mt-2">
          <Btn variant="outline" className="text-xs py-1 px-3" onClick={onEdit}>Editar</Btn>
          <Btn variant="danger"  className="text-xs py-1 px-3" onClick={onDelete}>Eliminar</Btn>
        </div>
      </div>
    </div>
  )
}

// ── Panels ────────────────────────────────────────────────────────────────────

function PostsPanel({ posts, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [imgFile, setImgFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() {
    setForm({ title: '', content: '', date: today(), published: 'true' })
    setImgFile(null); setModal({ isNew: true })
  }
  function openEdit(item) {
    setForm({ title: item.title, content: item.content, date: item.date, published: String(item.published) })
    setImgFile(null); setModal(item)
  }

  async function save() {
    setSaving(true)
    try {
      let image_url = modal.image_url ?? ''
      if (imgFile) image_url = await uploadImage(imgFile)
      const payload = { title: form.title, content: form.content, date: form.date, published: form.published === 'true', image_url }
      modal.isNew
        ? await supabase.from('posts').insert(payload)
        : await supabase.from('posts').update(payload).eq('id', modal.id)
      setModal(null); await reload()
      toast(modal.isNew ? 'Entrada creada' : 'Entrada actualizada', true)
    } catch { toast('Error al guardar', false) }
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('¿Eliminar esta entrada?')) return
    await supabase.from('posts').delete().eq('id', id)
    await reload(); toast('Entrada eliminada', true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Noticias / Blog</h2>
        <Btn onClick={openNew}>+ Nueva entrada</Btn>
      </div>

      {posts.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay entradas.</p><Btn onClick={openNew}>Crear primera entrada</Btn></div>
        : <div className="space-y-3">{posts.map(p => (
            <ItemCard key={p.id} thumb={p.image_url || '📝'} title={p.title || '(Sin título)'}
              meta={<span>{p.date}</span>} published={p.published}
              onEdit={() => openEdit(p)} onDelete={() => del(p.id)} />
          ))}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Nueva entrada' : 'Editar entrada'} onClose={() => setModal(null)}
          footer={<><Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn></>}>
          <Input label="Título" value={form.title||''} onChange={set('title')} placeholder="Título de la entrada" />
          <Textarea label="Contenido" value={form.content||''} onChange={set('content')} placeholder="Escribe aquí..." rows={5} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={form.date||''} onChange={set('date')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Publicado</option>
              <option value="false">Borrador</option>
            </Select>
          </div>
          <Field label="Imagen (opcional)">
            <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {modal.image_url && !imgFile && <img src={modal.image_url} alt="" className="mt-2 h-20 rounded-lg object-cover" />}
          </Field>
        </Modal>
      )}
    </>
  )
}

function VideosPanel({ videos, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [videoFile, setVideoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() { setForm({ title: '', description: '', date: today(), published: 'true' }); setVideoFile(null); setModal({ isNew: true }) }
  function openEdit(item) { setForm({ title: item.title, description: item.description||'', date: item.date, published: String(item.published) }); setVideoFile(null); setModal(item) }

  async function save() {
    if (modal.isNew && !videoFile) { toast('Selecciona un archivo de video', false); return }
    setSaving(true); setUploadProgress('')
    try {
      let url = modal.url ?? ''
      if (videoFile) { setUploadProgress('Subiendo video...'); url = await uploadVideo(videoFile) }
      setUploadProgress('')
      const payload = { title: form.title, url, description: form.description, date: form.date, published: form.published === 'true' }
      modal.isNew ? await supabase.from('videos').insert(payload) : await supabase.from('videos').update(payload).eq('id', modal.id)
      setModal(null); await reload(); toast(modal.isNew ? 'Video añadido' : 'Video actualizado', true)
    } catch (e) { toast(`Error: ${e.message || 'No se pudo guardar'}`, false) }
    setSaving(false); setUploadProgress('')
  }

  async function del(id) {
    if (!confirm('¿Eliminar este video?')) return
    await supabase.from('videos').delete().eq('id', id); await reload(); toast('Video eliminado', true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Videos</h2>
        <Btn onClick={openNew}>+ Subir video</Btn>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-c-bg3 border border-c-accent/20 text-sm text-c-muted">
        Sube videos inéditos (MP4). Se reproducen directamente en la web sin necesitar YouTube.
      </div>

      {videos.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay videos.</p><Btn onClick={openNew}>Subir primer video</Btn></div>
        : <div className="space-y-3">{videos.map(v => (
            <ItemCard key={v.id} thumb="🎬" title={v.title||'(Sin título)'}
              meta={<span>{v.date}</span>} published={v.published}
              onEdit={() => openEdit(v)} onDelete={() => del(v.id)} />
          ))}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Subir video' : 'Editar video'} onClose={() => setModal(null)}
          footer={
            <div className="flex items-center gap-3 w-full justify-end">
              {uploadProgress && <span className="text-xs text-c-muted">{uploadProgress}</span>}
              <Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          }>
          <Input label="Título" value={form.title||''} onChange={set('title')} placeholder="Nombre del video" />
          <Textarea label="Descripción (opcional)" value={form.description||''} onChange={set('description')} rows={3} />
          <Field label={modal.isNew ? 'Archivo de video *' : 'Reemplazar video (opcional)'}>
            <input type="file" accept="video/mp4,video/webm,video/*" onChange={e => setVideoFile(e.target.files[0])}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {modal.url && !videoFile && (
              <p className="mt-1 text-xs text-c-muted truncate">Actual: {modal.url.split('/').pop()}</p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={form.date||''} onChange={set('date')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Publicado</option><option value="false">Borrador</option>
            </Select>
          </div>
        </Modal>
      )}
    </>
  )
}

function ShowsPanel({ shows, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() { setForm({ title: '', venue: '', address: '', city: 'Lima, Perú', time: '', date: today(), published: 'true' }); setModal({ isNew: true }) }
  function openEdit(item) { setForm({ title: item.title, venue: item.venue||'', address: item.address||'', city: item.city||'Lima, Perú', time: item.time||'', date: item.date, published: String(item.published) }); setModal(item) }

  async function save() {
    setSaving(true)
    try {
      const payload = { title: form.title, venue: form.venue, address: form.address, city: form.city, time: form.time, date: form.date, published: form.published === 'true' }
      modal.isNew ? await supabase.from('shows').insert(payload) : await supabase.from('shows').update(payload).eq('id', modal.id)
      setModal(null); await reload(); toast(modal.isNew ? 'Show añadido' : 'Show actualizado', true)
    } catch { toast('Error al guardar', false) }
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('¿Eliminar este show?')) return
    await supabase.from('shows').delete().eq('id', id); await reload(); toast('Show eliminado', true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Shows</h2>
        <Btn onClick={openNew}>+ Nuevo show</Btn>
      </div>

      {shows.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay shows.</p><Btn onClick={openNew}>Agregar primer show</Btn></div>
        : <div className="space-y-3">{shows.map(s => {
            const d = new Date(s.date + 'T12:00:00')
            const thumb = (
              <div className="w-full h-full bg-gradient-to-br from-c-accent to-c-accent2 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none">{String(d.getDate()).padStart(2,'0')}</span>
                <span className="text-[8px] uppercase tracking-wider text-white/80">{MONTHS[d.getMonth()]}</span>
              </div>
            )
            return <ItemCard key={s.id} thumb={thumb} title={s.title}
              meta={<span>{s.venue}{s.city ? ` · ${s.city}` : ''}{s.time ? ` · ${s.time}` : ''}</span>} published={s.published}
              onEdit={() => openEdit(s)} onDelete={() => del(s.id)} />
          })}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Nuevo show' : 'Editar show'} onClose={() => setModal(null)}
          footer={<><Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn></>}>
          <Input label="Nombre del evento" value={form.title||''} onChange={set('title')} placeholder="Ej: YAWAR FEST II" />
          <Input label="Venue / Local" value={form.venue||''} onChange={set('venue')} placeholder="Ej: Resto Bar Camila" />
          <Input label="Dirección" value={form.address||''} onChange={set('address')} placeholder="Ej: Av. Micaela Bastidas..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ciudad" value={form.city||''} onChange={set('city')} />
            <Input label="Hora" type="time" value={form.time||''} onChange={set('time')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={form.date||''} onChange={set('date')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Publicado</option><option value="false">Borrador</option>
            </Select>
          </div>
        </Modal>
      )}
    </>
  )
}

function InstagramPanel({ igPosts, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() { setForm({ url: '', caption: '', sort_order: '0', published: 'true' }); setModal({ isNew: true }) }
  function openEdit(item) {
    setForm({ url: item.url, caption: item.caption||'', sort_order: String(item.sort_order||0), published: String(item.published) })
    setModal(item)
  }

  async function save() {
    setSaving(true)
    try {
      const payload = { url: form.url, caption: form.caption, sort_order: parseInt(form.sort_order)||0, published: form.published === 'true' }
      modal.isNew
        ? await supabase.from('instagram_posts').insert(payload)
        : await supabase.from('instagram_posts').update(payload).eq('id', modal.id)
      setModal(null); await reload(); toast(modal.isNew ? 'Post añadido' : 'Post actualizado', true)
    } catch { toast('Error al guardar', false) }
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('¿Eliminar este post de Instagram?')) return
    await supabase.from('instagram_posts').delete().eq('id', id); await reload(); toast('Post eliminado', true)
  }

  function shortcode(url) {
    const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
    return m ? m[1] : null
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Instagram</h2>
        <Btn onClick={openNew}>+ Añadir post</Btn>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-c-bg3 border border-c-accent/20 text-sm text-c-muted">
        Pega la URL de cada post de Instagram que quieras mostrar en la web. Cada vez que publiques algo nuevo en Instagram, añádelo aquí.
      </div>

      {igPosts.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay posts vinculados.</p><Btn onClick={openNew}>Añadir primer post</Btn></div>
        : <div className="space-y-3">{igPosts.map(p => {
            const sc = shortcode(p.url)
            const thumb = sc
              ? <img src={`https://www.instagram.com/p/${sc}/media/?size=t`} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
              : null
            return (
              <div key={p.id} className="flex gap-4 items-start bg-c-bg2 border border-c-accent/25 rounded-xl p-4">
                <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-c-bg3 flex items-center justify-center text-2xl relative">
                  {thumb}
                  <span className={sc ? 'hidden' : ''}>📷</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-c-muted truncate">{p.url}</div>
                  {p.caption && <div className="text-sm mt-0.5 truncate">{p.caption}</div>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-c-muted">Orden: {p.sort_order}</span>
                    <Badge published={p.published} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Btn variant="outline" className="text-xs py-1 px-3" onClick={() => openEdit(p)}>Editar</Btn>
                    <Btn variant="danger"  className="text-xs py-1 px-3" onClick={() => del(p.id)}>Eliminar</Btn>
                  </div>
                </div>
              </div>
            )
          })}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Añadir post de Instagram' : 'Editar post'} onClose={() => setModal(null)}
          footer={<><Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn></>}>
          <Input label="URL del post" type="url" value={form.url||''} onChange={set('url')} placeholder="https://www.instagram.com/p/ABC123/" />
          <Textarea label="Caption (opcional)" value={form.caption||''} onChange={set('caption')} placeholder="Descripción del post..." rows={3} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Orden (menor = primero)" type="number" value={form.sort_order||'0'} onChange={set('sort_order')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Publicado</option><option value="false">Oculto</option>
            </Select>
          </div>
        </Modal>
      )}
    </>
  )
}

function TracksPanel({ tracks, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() {
    setForm({ title: '', description: '', date: today(), published: 'true' })
    setAudioFile(null); setCoverFile(null); setModal({ isNew: true })
  }
  function openEdit(item) {
    setForm({ title: item.title, description: item.description||'', date: item.date, published: String(item.published) })
    setAudioFile(null); setCoverFile(null); setModal(item)
  }

  async function save() {
    if (modal.isNew && !audioFile) { toast('Selecciona un archivo de audio', false); return }
    setSaving(true); setUploadProgress('')
    try {
      let audio_url = modal.audio_url ?? ''
      let cover_url = modal.cover_url ?? ''
      if (audioFile) { setUploadProgress('Subiendo audio...'); audio_url = await uploadAudio(audioFile) }
      if (coverFile) { setUploadProgress('Subiendo portada...'); cover_url = await uploadImage(coverFile) }
      setUploadProgress('')
      const payload = { title: form.title, description: form.description, date: form.date, published: form.published === 'true', audio_url, cover_url }
      modal.isNew
        ? await supabase.from('tracks').insert(payload)
        : await supabase.from('tracks').update(payload).eq('id', modal.id)
      setModal(null); await reload(); toast(modal.isNew ? 'Track añadido' : 'Track actualizado', true)
    } catch (e) { toast(`Error: ${e.message || 'No se pudo guardar'}`, false) }
    setSaving(false); setUploadProgress('')
  }

  async function del(id) {
    if (!confirm('¿Eliminar este track?')) return
    await supabase.from('tracks').delete().eq('id', id); await reload(); toast('Track eliminado', true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Música / Demos</h2>
        <Btn onClick={openNew}>+ Subir track</Btn>
      </div>

      <div className="mb-4 p-4 rounded-xl bg-c-bg3 border border-c-accent/20 text-sm text-c-muted">
        Sube tus maquetas o demos en MP3. Aparecerán en la sección "Música" de la web con un player propio.
      </div>

      {tracks.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay tracks.</p><Btn onClick={openNew}>Subir primer track</Btn></div>
        : <div className="space-y-3">{tracks.map(t => (
            <ItemCard key={t.id} thumb={t.cover_url || '🎵'} title={t.title||'(Sin título)'}
              meta={<span>{t.date}</span>} published={t.published}
              onEdit={() => openEdit(t)} onDelete={() => del(t.id)} />
          ))}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Subir track' : 'Editar track'} onClose={() => setModal(null)}
          footer={
            <div className="flex items-center gap-3 w-full justify-end">
              {uploadProgress && <span className="text-xs text-c-muted">{uploadProgress}</span>}
              <Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn>
              <Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
            </div>
          }>
          <Input label="Título del track" value={form.title||''} onChange={set('title')} placeholder="Ej: Quemando el cielo (demo)" />
          <Textarea label="Descripción (opcional)" value={form.description||''} onChange={set('description')} placeholder="Info sobre la maqueta, año, etc." rows={3} />
          <Field label={modal.isNew ? 'Archivo MP3 *' : 'Reemplazar MP3 (opcional)'}>
            <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={e => setAudioFile(e.target.files[0])}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {modal.audio_url && !audioFile && (
              <p className="mt-1 text-xs text-c-muted truncate">Actual: {modal.audio_url.split('/').pop()}</p>
            )}
          </Field>
          <Field label="Portada (opcional)">
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {modal.cover_url && !coverFile && <img src={modal.cover_url} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={form.date||''} onChange={set('date')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Publicado</option><option value="false">Borrador</option>
            </Select>
          </div>
        </Modal>
      )}
    </>
  )
}

function SettingsPanel({ settings, reload, toast }) {
  const ALL_KEYS = [
    'band_cover_url', 'band_bio', 'band_genres', 'band_location',
    'spotify_url', 'youtube_url', 'tiktok_url', 'facebook_url', 'threads_url',
    'booking_highlights', 'booking_description', 'booking_manager', 'booking_email', 'booking_phone', 'booking_rider',
  ]

  const [form, setForm] = useState(() => {
    const f = {}; ALL_KEYS.forEach(k => { f[k] = settings[k] ?? '' }); return f
  })
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleCoverUpload(file) {
    setCoverUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(f => ({ ...f, band_cover_url: url }))
    } catch { toast('Error subiendo foto', false) }
    setCoverUploading(false)
  }

  useEffect(() => {
    const f = {}; ALL_KEYS.forEach(k => { f[k] = settings[k] ?? '' }); setForm(f)
  }, [settings])

  async function save(e) {
    e.preventDefault(); setSaving(true)
    try {
      await Promise.all(ALL_KEYS.map(k => supabase.from('settings').upsert({ key: k, value: form[k] || '' })))
      await reload(); toast('Configuración guardada', true)
    } catch { toast('Error al guardar', false) }
    setSaving(false)
  }

  const sectionCls = 'bg-c-bg2 border border-c-accent/25 rounded-xl p-6 space-y-4'

  return (
    <>
      <h2 className="text-2xl font-black mb-6">Configuración</h2>

      <form onSubmit={save} className="space-y-5 max-w-lg">

        {/* Banda */}
        <div className={sectionCls}>
          <h3 className="font-black text-base mb-1">La banda</h3>
          <p className="text-xs text-c-muted mb-3">Aparece en el hero y en la página de Booking.</p>
          <Field label="Foto grupal (portada)">
            {form.band_cover_url && (
              <img src={form.band_cover_url} alt="" className="w-full h-36 object-cover rounded-xl mb-2" />
            )}
            <input type="file" accept="image/*"
              onChange={e => { const f = e.target.files[0]; if (f) handleCoverUpload(f) }}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {coverUploading && <p className="text-xs text-c-muted mt-1">Subiendo foto...</p>}
            <p className="text-xs text-c-muted mt-1">Se muestra en la sección "La banda" e inicio del Booking.</p>
          </Field>
          <Field label="Géneros (separados por coma)">
            <input type="text" value={form.band_genres||''} onChange={set('band_genres')}
              placeholder="Rock Alternativo,Rock Fusion,Pop Punk,Indie Rock" className={inputCls} />
          </Field>
          <Field label="Ciudad / País">
            <input type="text" value={form.band_location||''} onChange={set('band_location')}
              placeholder="Lima, Perú" className={inputCls} />
          </Field>
          <Field label="Descripción / Bio">
            <textarea value={form.band_bio||''} onChange={set('band_bio')} rows={4}
              placeholder="Descripción de la banda para el booking y la web..."
              className={`${inputCls} resize-y`} />
          </Field>
        </div>

        {/* Redes */}
        <div className={sectionCls}>
          <h3 className="font-black text-base mb-1">Redes sociales</h3>
          <p className="text-xs text-c-muted mb-3">Botones que aparecen en el hero. Deja en blanco lo que no quieras mostrar.</p>
          {[
            { key: 'spotify_url',  label: 'Spotify',  ph: 'https://open.spotify.com/artist/...' },
            { key: 'youtube_url',  label: 'YouTube',  ph: 'https://www.youtube.com/@covalente'  },
            { key: 'tiktok_url',   label: 'TikTok',   ph: 'https://www.tiktok.com/@covalente'  },
            { key: 'facebook_url', label: 'Facebook', ph: 'https://www.facebook.com/covalente'  },
            { key: 'threads_url',  label: 'Threads',  ph: 'https://www.threads.net/@covalente'  },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <input type="url" value={form[f.key]||''} onChange={set(f.key)} placeholder={f.ph} className={inputCls} />
            </Field>
          ))}
        </div>

        {/* Booking */}
        <div className={sectionCls}>
          <h3 className="font-black text-base mb-1">Booking</h3>
          <p className="text-xs text-c-muted mb-3">Información para la página de booking / carta de presentación.</p>
          <Field label="Trayectoria / Lugares donde hemos tocado">
            <textarea value={form.booking_highlights||''} onChange={set('booking_highlights')} rows={4}
              placeholder="Yawar Fest II 2024, Resto Bar Camila, Arena Perú, Fecha con [Banda X]..."
              className={`${inputCls} resize-y`} />
            <p className="mt-1 text-xs text-c-muted">Aparece destacado en la sección Trayectoria. Los shows que añades desde el panel Shows también se muestran automáticamente.</p>
          </Field>
          <Field label="Descripción para shows">
            <textarea value={form.booking_description||''} onChange={set('booking_description')} rows={4}
              placeholder="Qué tipo de shows hacen, qué necesitan, propuesta artística..."
              className={`${inputCls} resize-y`} />
          </Field>
          <Input label="Manager / Contacto" value={form.booking_manager||''} onChange={set('booking_manager')} placeholder="Nombre del representante o contacto" />
          <Field label="Email de booking">
            <input type="email" value={form.booking_email||''} onChange={set('booking_email')}
              placeholder="booking@covalente.com" className={inputCls} />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <input type="tel" value={form.booking_phone||''} onChange={set('booking_phone')}
              placeholder="+51 999 999 999" className={inputCls} />
          </Field>
          <Field label="Rider técnico">
            <textarea value={form.booking_rider||''} onChange={set('booking_rider')} rows={5}
              placeholder="PA, monitores, backline, camarines, pases, etc."
              className={`${inputCls} resize-y font-mono text-xs`} />
          </Field>
        </div>

        <div className="flex justify-end">
          <Btn type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar todo'}</Btn>
        </div>
      </form>
    </>
  )
}

function MembersPanel({ members, reload, toast }) {
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [photoFile, setPhotoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function openNew() {
    setForm({ name: '', role: '', bio: '', sort_order: '0', published: 'true' })
    setPhotoFile(null); setModal({ isNew: true })
  }
  function openEdit(item) {
    setForm({ name: item.name, role: item.role||'', bio: item.bio||'', sort_order: String(item.sort_order||0), published: String(item.published) })
    setPhotoFile(null); setModal(item)
  }

  async function save() {
    setSaving(true)
    try {
      let photo_url = modal.photo_url ?? ''
      if (photoFile) photo_url = await uploadImage(photoFile)
      const payload = { name: form.name, role: form.role, bio: form.bio, sort_order: parseInt(form.sort_order)||0, published: form.published === 'true', photo_url }
      modal.isNew
        ? await supabase.from('members').insert(payload)
        : await supabase.from('members').update(payload).eq('id', modal.id)
      setModal(null); await reload(); toast(modal.isNew ? 'Integrante añadido' : 'Integrante actualizado', true)
    } catch (e) { toast(`Error: ${e.message || 'No se pudo guardar'}`, false) }
    setSaving(false)
  }

  async function del(id) {
    if (!confirm('¿Eliminar este integrante?')) return
    await supabase.from('members').delete().eq('id', id); await reload(); toast('Integrante eliminado', true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Integrantes</h2>
        <Btn onClick={openNew}>+ Añadir integrante</Btn>
      </div>

      {members.length === 0
        ? <div className="text-center py-16 text-c-muted"><p className="mb-3">Aún no hay integrantes.</p><Btn onClick={openNew}>Añadir primero</Btn></div>
        : <div className="space-y-3">{members.map(m => (
            <ItemCard key={m.id} thumb={m.photo_url || '🎸'} title={m.name}
              meta={<span className="text-c-accent3">{m.role}</span>} published={m.published}
              onEdit={() => openEdit(m)} onDelete={() => del(m.id)} />
          ))}</div>
      }

      {modal && (
        <Modal title={modal.isNew ? 'Añadir integrante' : 'Editar integrante'} onClose={() => setModal(null)}
          footer={<><Btn variant="outline" onClick={() => setModal(null)}>Cancelar</Btn><Btn onClick={save} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Btn></>}>
          <Input label="Nombre" value={form.name||''} onChange={set('name')} placeholder="Ej: Diego Acosta" />
          <Input label="Rol / Instrumento" value={form.role||''} onChange={set('role')} placeholder="Ej: Guitarra y voz" />
          <Textarea label="Bio corta (opcional)" value={form.bio||''} onChange={set('bio')} placeholder="Una frase sobre este integrante..." rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Orden (menor = primero)" type="number" value={form.sort_order||'0'} onChange={set('sort_order')} />
            <Select label="Estado" value={form.published||'true'} onChange={set('published')}>
              <option value="true">Visible</option><option value="false">Oculto</option>
            </Select>
          </div>
          <Field label="Foto (opcional)">
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])}
              className="w-full text-sm text-c-muted file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-c-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer" />
            {modal.photo_url && !photoFile && (
              <img src={modal.photo_url} alt="" className="mt-2 w-16 h-16 rounded-full object-cover" />
            )}
          </Field>
        </Modal>
      )}
    </>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [tab, setTab] = useState('posts')
  const [data, setData] = useState({ posts: [], videos: [], shows: [], igPosts: [], tracks: [], members: [], settings: {} })
  const [toastState, setToastState] = useState(null)

  async function reload() {
    const [p, v, s, ig, tr, mb, cfg] = await Promise.all([
      supabase.from('posts').select().order('created_at', { ascending: false }),
      supabase.from('videos').select().order('created_at', { ascending: false }),
      supabase.from('shows').select().order('date', { ascending: false }),
      supabase.from('instagram_posts').select().order('sort_order', { ascending: true }),
      supabase.from('tracks').select().order('created_at', { ascending: false }),
      supabase.from('members').select().order('sort_order', { ascending: true }),
      supabase.from('settings').select(),
    ])
    const settings = {}
    ;(cfg.data ?? []).forEach(row => { settings[row.key] = row.value })
    setData({
      posts:    p.data  ?? [],
      videos:   v.data  ?? [],
      shows:    s.data  ?? [],
      igPosts:  ig.data ?? [],
      tracks:   tr.data ?? [],
      members:  mb.data ?? [],
      settings,
    })
  }

  useEffect(() => { reload() }, [])

  function toast(msg, ok) {
    setToastState({ msg, ok })
    setTimeout(() => setToastState(null), 3000)
  }

  const tabs = [
    { key: 'posts',       label: 'Noticias'    },
    { key: 'videos',      label: 'Videos'      },
    { key: 'shows',       label: 'Shows'       },
    { key: 'instagram',   label: 'Instagram'   },
    { key: 'tracks',      label: 'Música'      },
    { key: 'members',     label: 'Integrantes' },
    { key: 'settings',    label: 'Config'      },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A16] text-c-text">
      <header className="sticky top-0 z-10 bg-c-bg2 border-b border-c-accent/30 flex items-center justify-between px-6 py-4">
        <div className="font-black text-lg tracking-widest uppercase">
          Co<span className="text-c-accent2">val</span>ente
          <span className="text-c-muted font-normal text-sm ml-2 normal-case tracking-normal">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-c-muted text-sm hover:text-c-accent3 transition-colors">Ver sitio →</a>
          <Btn variant="outline" className="text-xs" onClick={() => supabase.auth.signOut()}>Cerrar sesión</Btn>
        </div>
      </header>

      <div className="bg-c-bg2 border-b border-c-accent/30 flex overflow-x-auto px-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors ${tab === t.key ? 'text-c-accent3 border-c-accent2' : 'text-c-muted border-transparent hover:text-c-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="max-w-3xl mx-auto p-6">
        {tab === 'posts'     && <PostsPanel     posts={data.posts}       reload={reload} toast={toast} />}
        {tab === 'videos'    && <VideosPanel    videos={data.videos}     reload={reload} toast={toast} />}
        {tab === 'shows'     && <ShowsPanel     shows={data.shows}       reload={reload} toast={toast} />}
        {tab === 'instagram' && <InstagramPanel igPosts={data.igPosts}   reload={reload} toast={toast} />}
        {tab === 'tracks'    && <TracksPanel    tracks={data.tracks}     reload={reload} toast={toast} />}
        {tab === 'members'   && <MembersPanel   members={data.members}   reload={reload} toast={toast} />}
        {tab === 'settings'  && <SettingsPanel  settings={data.settings} reload={reload} toast={toast} />}
      </main>

      {toastState && <Toast msg={toastState.msg} ok={toastState.ok} />}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center px-4 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(123,47,190,0.3),transparent_70%)]">
      <form onSubmit={handleLogin} className="bg-c-bg2 border border-c-accent/30 rounded-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-black mb-1">Co<span className="text-c-accent2">val</span>ente</h1>
        <p className="text-c-muted text-sm mb-6">Panel de administración</p>
        <div className="space-y-3 text-left mb-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@covalente.com" required />
          <Input label="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <Btn variant="primary" type="submit" disabled={loading} className="w-full justify-center">
          {loading ? 'Entrando...' : 'Entrar'}
        </Btn>
      </form>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Admin() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabase) { setSession(null); return }
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-c-accent2 border-t-transparent animate-spin" />
    </div>
  )

  if (!supabase) return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center text-c-muted text-center px-8">
      <div>
        <p className="text-lg font-bold text-c-text mb-2">Supabase no configurado</p>
        <p>Crea un archivo <code className="text-c-accent3">.env.local</code> con tus credenciales.<br />Ver <code className="text-c-accent3">.env.example</code> para el formato.</p>
      </div>
    </div>
  )

  return session ? <Dashboard /> : <LoginScreen />
}
