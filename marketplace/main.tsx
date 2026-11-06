import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Header, Button, FilterTab, SpecimenCard, SpecimenDetails, EmptyState, Dialog, OfferForm, OfferSummary, Message, MessageComposer, ImageUpload, Field, DepartmentAccordion } from '../packages/mizu-ui/src/index.js';
import { listings as originals, sellers, departments, money, varieties, handovers, storageKey, restoreState, validateListing, submitOffer } from './state.js';
import '../packages/mizu-ui/src/tokens.css';
import '../packages/mizu-ui/src/styles.css';
import './styles.css';

type Listing = typeof originals[number] & { image?: string };
type Route = 'collection' | 'offers' | 'sell' | 'saved';
const routeFromHash = (): Route => ['offers', 'sell', 'saved'].includes(location.hash.slice(1)) ? location.hash.slice(1) as Route : 'collection';
const navigate = (route: Route) => { location.hash = route; };
const sellerFor = (item: Listing) => sellers.find(seller => seller.id === item.sellerId) || { name: 'Your collection', location: item.location };
function loadState() {
  try {
    const legacy = JSON.parse(localStorage.getItem('mizu-shortlist') || localStorage.getItem('sui-shortlist') || '[]');
    return restoreState(localStorage.getItem(storageKey), Array.isArray(legacy) ? legacy : []);
  } catch { return restoreState(null); }
}

function Artwork({ item }: { item: Listing }) {
  if (item.image) return <img className="listing-photo" src={item.image} alt={item.title} />;
  const art = item.artwork;
  return <span className="sprite-window" style={{ '--sprite-index': art.index, '--sprite-columns': art.columns, '--sprite-aspect': art.aspect } as CSSProperties}>
    <img src={art.src} alt={`${item.name} koi, viewed from above`} />
  </span>;
}

function DepartmentImage({ item }: { item: { name: string; photoUrl: string } }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="photo-unavailable" role="img" aria-label={`${item.name}: image unavailable`}>Image unavailable</span>
    : <img className="department-photo" src={item.photoUrl} alt={item.name} loading="lazy" onError={() => setFailed(true)} />;
}

function SellForm({ onPublish }: { onPublish: (draft: any, image: string) => void }) {
  const [draft, setDraft] = useState({ title: '', variety: 'Kohaku', length: '', price: '', breeder: '', location: '', notes: '', handover: handovers[0] });
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  function field(key: keyof typeof draft, label: string, extra = {}) {
    return <Field label={label} value={draft[key]} onValueChange={value => { setDraft(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: '' })); }} errorText={errors[key]} {...extra} />;
  }
  return <form className="listing-form" noValidate onSubmit={event => {
    event.preventDefault();
    const next = validateListing(draft, image); setErrors(next);
    if (Object.keys(next).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>('.listing-form [aria-invalid="true"]')?.focus()); return; }
    onPublish(draft, image);
  }}>
    <div className="listing-image-column">
      {image && <img src={image} alt="Your specimen preview" className="upload-preview" />}
      <ImageUpload onFileSelect={async file => {
        if (file.size > 2 * 1024 * 1024) throw new Error('Choose an image smaller than 2 MB.');
        const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('The image could not be read. Try again.')); reader.readAsDataURL(file); });
        await new Promise<void>((resolve, reject) => { const preview = new Image(); preview.onload = () => resolve(); preview.onerror = () => reject(new Error('This image could not be opened. Choose another PNG or JPG.')); preview.src = data; });
        setImage(data); setErrors(previous => ({ ...previous, image: '' }));
      }} />
      {errors.image && <p role="alert" className="form-error">{errors.image}</p>}
      <p className="quiet-note">Use your own overhead photograph. PNG or JPG, up to 2 MB.</p>
    </div>
    <div className="listing-fields">
      <div className="field-pair">{field('title', 'Title', { required: true, placeholder: 'Nisai Marudo Kohaku' })}{field('variety', 'Variety', { kind: 'Select', options: varieties.map(value => ({ label: value, value })) })}</div>
      <div className="field-pair">{field('length', 'Length (cm)', { inputType: 'number', required: true })}{field('price', 'Price (USD)', { inputType: 'number', required: true })}</div>
      <div className="field-pair">{field('breeder', 'Breeder', { placeholder: 'If known' })}{field('location', 'Location', { required: true, placeholder: 'City, region' })}</div>
      {field('handover', 'Handover arrangement', { kind: 'Select', options: handovers.map(value => ({ label: value, value })) })}
      {field('notes', 'Condition & quarantine notes', { kind: 'Textarea', required: true })}
      <Button type="submit" label="Publish specimen" />
    </div>
  </form>;
}

function App() {
  const [state, setState] = useState(loadState);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [filter, setFilter] = useState('all');
  const [department, setDepartment] = useState('koi');
  const [departmentTitle, setDepartmentTitle] = useState('The Collection');
  const [detail, setDetail] = useState<Listing | null>(null);
  const [offer, setOffer] = useState<Listing | null>(null);
  const [grid, setGrid] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [undoReset, setUndoReset] = useState<ReturnType<typeof restoreState> | null>(null);
  const [expanded, setExpanded] = useState(new Set(['conv-kohaku-01']));
  const [counter, setCounter] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterError, setCounterError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const all: Listing[] = [...originals, ...state.custom];
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);
  useEffect(() => {
    const syncRoute = () => { setRoute(routeFromHash()); setDetail(null); setOffer(null); setDrawer(false); };
    const prepare = () => flushSync(() => { setRoute('collection'); setDepartment('koi'); setDepartmentTitle('The Collection'); setFilter('all'); });
    const closeDialogs = () => { setDetail(null); setOffer(null); setDrawer(false); };
    const syncStorage = (event: StorageEvent) => { if (event.key === storageKey && event.newValue) setState(restoreState(event.newValue)); };
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('mizu:prepare-collection', prepare);
    window.addEventListener('mizu:close-dialogs', closeDialogs);
    window.addEventListener('storage', syncStorage);
    return () => { window.removeEventListener('hashchange', syncRoute); window.removeEventListener('mizu:prepare-collection', prepare); window.removeEventListener('mizu:close-dialogs', closeDialogs); window.removeEventListener('storage', syncStorage); };
  }, []);
  useEffect(() => { if (location.hash !== '#pond') { document.title = `${route === 'collection' ? departmentTitle : route[0].toUpperCase() + route.slice(1)} — MIZU`; heading.current?.focus({ preventScroll: true }); } }, [route, departmentTitle]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4200); return () => clearTimeout(timer); }, [notice]);
  function save(item: Listing) { setState(previous => ({ ...previous, saved: previous.saved.includes(item.id) ? previous.saved.filter(id => id !== item.id) : [...previous.saved, item.id] })); }
  function chooseDepartment(category: string, title: string, variety = 'all') { setDepartment(category); setDepartmentTitle(title); setFilter(variety); setDrawer(false); navigate('collection'); }
  function updateThread(id: string, update: (thread: any) => any) { setState(previous => ({ ...previous, threads: previous.threads.map(thread => thread.id === id ? update(thread) : thread) })); }
  const filtered = all.filter(item => (filter === 'all' || item.variety === filter) && (route !== 'saved' || state.saved.includes(item.id)));
  const savedView = route === 'saved';
  const title = route === 'offers' ? 'Offers' : route === 'sell' ? 'List a Specimen' : savedView ? 'Saved Specimens' : departmentTitle;
  return <>
    <Header brandHref="#pond" currentHref={`#${route}`} onMenuClick={() => setDrawer(true)} className="market-header" routes={[
      { label: 'Collection', href: '#collection' }, { label: 'Offers', href: '#offers', count: `(${state.threads.filter(thread => thread.unread).length})` }, { label: 'Sell', href: '#sell' }, { label: 'Saved', href: '#saved', count: `(${state.saved.length})` },
    ]} />
    <div className="market-content">
      <h2 id="catalog-title" ref={heading} tabIndex={-1} className="market-title">{title}</h2>
      {(route === 'collection' || savedView) && <>
        {(department === 'koi' || savedView) && <div className="market-filters" role="group" aria-label="Filter by koi variety">{['all', 'Kohaku', 'Showa', 'Sanke', 'Ogon'].map(value => <FilterTab key={value} label={value === 'all' ? 'All' : value} count={String(savedView ? state.saved.length : all.length).padStart(2, '0')} showCount={value === 'all'} selected={filter === value} onClick={() => setFilter(value)} />)}</div>}
        {department === 'koi' || savedView ? <>
          <div className="market-grid" id="fish-grid">{filtered.map(item => <SpecimenCard key={item.id} title={item.name} metadata={`${item.size} · ${money(item.price)}`} reference={item.number} showReference media={<Artwork item={item} />} data-specimen={item.id} onClick={() => { setGrid(false); setDetail(item); }} aria-label={`View ${item.name} ${item.number}`} />)}</div>
          {!filtered.length && <EmptyState reason={savedView ? 'Saved' : 'Results'} onAction={() => { setFilter('all'); navigate('collection'); }} />}
        </> : <div className="market-grid">{(departments[department] || []).map(item => <SpecimenCard key={item.id} title={item.name} metadata={`${item.size} · ${money(item.price)}`} reference={item.number} showReference media={<DepartmentImage item={item} />} onClick={() => setNotice('This department is a preview. Offers are currently available for koi.')} />)}</div>}
      </>}
      {route === 'offers' && <div className="threads">{state.threads.map(thread => {
        const item = all.find(item => item.id === thread.listingId); if (!item) return null;
        const seller = sellerFor(item), open = expanded.has(thread.id);
        return <article className="thread" key={thread.id}>
          <OfferSummary title={item.name} seller={`${seller.name} · ${seller.location}`} status={thread.status as any} amount={`· ${money(thread.amount)}`} media={<Artwork item={item} />} aria-expanded={open} aria-controls={`body-${thread.id}`} onClick={() => {
            setExpanded(previous => { const next = new Set(previous); if (next.has(thread.id)) next.delete(thread.id); else next.add(thread.id); return next; });
            updateThread(thread.id, previous => ({ ...previous, unread: false }));
          }} />
          <div id={`body-${thread.id}`} hidden={!open} className="thread-body">
            <div className="negotiation"><div><strong>{money(thread.amount)}</strong><span>Asking {money(item.price)}</span></div><div className="thread-actions">
              {thread.status === 'Counter' && <Button label="Accept" onClick={() => { updateThread(thread.id, previous => ({ ...previous, status: 'Reserved', messages: [...previous.messages, { id: crypto.randomUUID(), text: `Offer accepted at ${money(previous.amount)}. Coordinate viewing and handover here.`, sent: true, time: 'Just now' }] })); setNotice('Specimen reserved in this demo.'); }} />}
              {thread.status !== 'Reserved' && <Button appearance="Secondary" label={counter === thread.id ? 'Cancel' : 'Counter'} onClick={() => { setCounter(counter === thread.id ? null : thread.id); setCounterAmount(String(thread.amount)); setCounterError(''); }} />}
              <Button appearance="Secondary" label="View koi" onClick={() => { setGrid(false); setDetail(item); }} />
            </div></div>
            {counter === thread.id && <form className="counter-form" onSubmit={event => { event.preventDefault(); const amount = Number(counterAmount); if (!Number.isFinite(amount) || amount <= 0) { setCounterError('Enter an amount greater than zero.'); return; } updateThread(thread.id, previous => ({ ...previous, status: 'Pending', amount, messages: [...previous.messages, { id: crypto.randomUUID(), text: `I propose ${money(amount)}.`, sent: true, time: 'Just now' }] })); setCounter(null); setNotice('Counteroffer saved.'); }}><Field label="New offer amount (USD)" value={counterAmount} onValueChange={setCounterAmount} errorText={counterError} inputType="number" /><Button type="submit" label="Send offer" /></form>}
            <div className="message-list">{thread.messages.map(message => <Message key={message.id} message={message.text} timestamp={message.time} direction={message.sent ? 'Sent' : 'Received'} />)}</div>
            <MessageComposer onSend={text => { updateThread(thread.id, previous => ({ ...previous, messages: [...previous.messages, { id: crypto.randomUUID(), text, sent: true, time: 'Just now' }] })); setNotice('Message saved in this demo.'); }} />
          </div>
        </article>;
      })}</div>}
      <div hidden={route !== 'sell'}><SellForm key={state.custom.length} onPublish={(draft, image) => {
        const item = { id: `custom-${crypto.randomUUID()}`, name: draft.variety, title: draft.title.trim(), variety: draft.variety, price: Number(draft.price), size: `${Number(draft.length)} cm`, number: String(all.length + 1).padStart(2, '0'), location: draft.location.trim(), breeder: draft.breeder.trim() || 'Not provided', description: draft.notes.trim(), fulfilment: [draft.handover], image };
        setState(previous => ({ ...previous, custom: [...previous.custom, item] })); setFilter('all'); setDepartment('koi'); setDepartmentTitle('The Collection'); navigate('collection'); setNotice('Your specimen was added to this local collection.');
      }} /></div>
      <div className="demo-note">Interactive prototype · listings, offers and messages stay in this browser.
        <Button appearance="Text" label="Reset demo" onClick={() => { setUndoReset(state); setState(restoreState(null)); setExpanded(new Set(['conv-kohaku-01'])); setCounter(null); setFilter('all'); setDepartment('koi'); setDepartmentTitle('The Collection'); navigate('collection'); setNotice('Demo reset. Use Undo reset to restore your previous changes.'); }} />
        {undoReset && <Button appearance="Text" label="Undo reset" onClick={() => { setState(undoReset); setUndoReset(null); setNotice('Your previous changes were restored.'); }} />}
      </div>
      {storageError && <p role="alert" className="form-error">Changes are available in this tab but could not be saved. Browser storage may be full or unavailable.</p>}
    </div>
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.title || 'Specimen details'} className="detail-dialog" body={detail && <div className="detail-layout">
      <div className={`detail-portrait ${grid ? 'calibrated' : ''}`}><Artwork item={detail} /><div className="portrait-controls"><span>{detail.waterParameters || 'Water parameters not provided'}</span><Button appearance="Secondary" label="Calibrated grid" aria-pressed={grid} onClick={() => setGrid(!grid)} /></div></div>
      <SpecimenDetails title={detail.title} price={money(detail.price)} seller={`${sellerFor(detail).name} · ${detail.location}`} description={`${detail.description}${detail.conditionNotes ? `. ${detail.conditionNotes}` : ''}`} facts={[{ label: 'Length & age', value: `${detail.size} · ${detail.age || 'Age not provided'}` }, { label: 'Breeder', value: detail.breeder || 'Not provided' }, { label: 'Quarantine', value: detail.quarantineStatus || 'Not provided' }, { label: 'Handover', value: detail.fulfilment.join(' · ') }]} saved={state.saved.includes(detail.id)} onSave={() => save(detail)} onMakeOffer={() => { setOffer(detail); setDetail(null); }} />
    </div>} />
    <Dialog open={Boolean(offer)} onClose={() => setOffer(null)} title="Propose an offer" className="offer-dialog" body={offer && <OfferForm key={offer.id} askingPrice={money(offer.price)} specimen={offer.name} reference={`N° ${offer.number}`} initialValue={{ amount: String(Math.round(offer.price * .94 / 10) * 10) }} handoverOptions={offer.fulfilment.map(value => ({ label: value, value }))} onSubmit={value => {
      const threads = submitOffer(state.threads, offer, value); setState(previous => ({ ...previous, threads })); setExpanded(previous => new Set([...previous, threads[0].id])); setOffer(null); navigate('offers'); setNotice('Offer saved in this demo.');
    }} />} />
    <Dialog open={drawer} onClose={() => setDrawer(false)} title="Departments" className="department-drawer" body={<div onClick={event => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#department-"]'); if (!link) return;
      event.preventDefault(); const [category, variety = 'all'] = link.hash.slice('#department-'.length).split(':'); chooseDepartment(category, link.textContent || 'The Collection', variety);
    }}><h2>Departments</h2>{[
      { label: 'Living Specimens', links: [['Pedigree Nishikigoi', 'koi'], ['Gosanke Lineages', 'koi:Kohaku'], ['Imperial Bonsai & Flora', 'plants'], ['Suiseki Viewing Stones', 'plants']] },
      { label: 'Scholar’s Studio & Works of Art', links: [['Song & Ming Ceramics', 'antiques'], ['Tokoname & Bizen Ware', 'antiques'], ['Hetian Jade & Gongshi Rocks', 'antiques'], ['Zitan & Bamboo Carvings', 'antiques']] },
      { label: 'Tea Culture, Incense & Bronzes', links: [['Chawan & Tea Utensils', 'tea'], ['Koro Censers & Agarwood', 'tea'], ['Archaic Bronzes & Tetsubin', 'tea'], ['Vintage Pu-erh & Rare Whisky', 'tea']] },
      { label: 'Blades, Classical Ink & Horology', links: [['Nihonto & Tosogu Fittings', 'timepieces'], ['Kakemono Scrolls & Byobu', 'timepieces'], ['Independent & Urushi Horology', 'timepieces']] },
    ].map(group => <DepartmentAccordion key={group.label} label={group.label} defaultExpanded items={group.links.map(([label, category]) => ({ label, href: `#department-${category}` }))} />)}</div>} />
    {notice && <p role="status" className="market-toast">{notice}</p>}
  </>;
}

flushSync(() => createRoot(document.getElementById('marketplace-root')!).render(<App />));
