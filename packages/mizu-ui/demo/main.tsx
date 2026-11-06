import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Brand, Button, DepartmentAccordion, Dialog, EmptyState, FactRow, Field, FilterTab, Header,
  Icon, IconButton, ImageUpload, MediaBonsai, MediaCeramic, MediaKoi, Message, MessageComposer,
  NavigationItem, OfferForm, OfferSummary, SpecimenCard, SpecimenDetails, StatusBadge,
  type IconName,
} from '../src/index.js';
import '../src/tokens.css';
import '../src/styles.css';
import './showcase.css';

const icons: IconName[] = ['close', 'plus', 'chevron', 'down', 'menu', 'upload', 'check', 'spinner'];
const handover = [{ value: 'pondside', label: 'Pondside collection' }, { value: 'courier', label: 'Arrange courier' }];

function App() {
  const [filter, setFilter] = useState('Kohaku');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return <main className="showcase">
    <div className="showcase__eyebrow">MIZU / REACT COMPONENT LIBRARY</div>
    <h1>Component gallery</h1>
    <p className="showcase__intro">Reusable controls and marketplace compositions built from the Figma library. Try filters, uploads, accordions, forms and the dialog.</p>
    <section className="showcase__section"><h2>Controls</h2><p>Variants use semantic tokens and native keyboard behavior.</p>
      <div className="showcase__row"><Button label="Make an offer" /><Button label="Make an offer" appearance="Secondary" /><Button label="Make an offer" appearance="Text" /><Button label="Sending…" state="Loading" /><IconButton label="Close" /></div>
      <div className="showcase__row"><NavigationItem label="Collection" href="#collection" state="Selected" /><NavigationItem label="Offers" href="#offers" /><IconButton label="Open menu" icon="menu" />{['Kohaku', 'Showa', 'Bonsai'].map(name => <FilterTab key={name} label={name} selected={filter === name} onClick={() => setFilter(name)} />)}</div>
      <div className="showcase__row">{(['Counter', 'Reserved', 'Pending', 'Closed'] as const).map(status => <StatusBadge key={status} status={status} amount={status === 'Counter' ? '· $2,320' : undefined} />)}</div>
      <div className="showcase__fields"><Field label="Your offer (USD)" placeholder="Enter amount" /><Field kind="Select" label="Handover preference" placeholder="Choose a preference" options={handover} /><Field kind="Textarea" label="Message to seller" placeholder="Write a message" /></div>
      <div className="showcase__row showcase__icons">{icons.map(name => <span key={name} title={name}><Icon name={name} /><small>{name}</small></span>)}</div>
    </section>
    <section className="showcase__section" id="collection"><h2>Collection &amp; media</h2><div className="showcase__row"><Brand /><Header /></div>
      <div className="showcase__cards"><SpecimenCard title="Kohaku" metadata="54 cm · $2,400" reference="N° 01" showReference onClick={() => setDialogOpen(true)} /><SpecimenCard title="Qing Kangxi Blue & White Baluster Vase" metadata="36.5 cm · $6,800" mediaKind="Ceramic" onClick={() => setDialogOpen(true)} /><SpecimenCard title="Itoigawa Shimpaku Juniper" metadata="44 cm · $1,650" mediaKind="Bonsai" onClick={() => setDialogOpen(true)} /></div>
      <div className="showcase__cards"><MediaKoi alt="Red and white koi from above" /><MediaCeramic alt="Blue and white ceramic vase" /><MediaBonsai alt="Bonsai tree" /></div>
    </section>
    <section className="showcase__section" id="offers"><h2>Offers &amp; conversation</h2><div className="showcase__split">
      <div className="showcase__stack"><OfferSummary title="Kohaku" seller="Mizuho Koi House · Sonoma, CA" status="Counter" amount="· $2,320" /><OfferSummary title="Kohaku" seller="Mizuho Koi House · Sonoma, CA" status="Reserved" amount="· $1,680" /><Message direction="Sent" message="Offering $2,320 with collection this Saturday." timestamp="Tue · Read" /><Message message="Thank you. I can arrange a viewing at 10:00 AM." timestamp="Wed" /><MessageComposer onSend={async () => { await new Promise(resolve => setTimeout(resolve, 500)); }} /></div>
      <DepartmentAccordion label="Living Specimens" items={[{ label: 'Pedigree Nishikigoi', href: '#koi' }, { label: 'Imperial Bonsai & Flora', href: '#bonsai' }, { label: 'Suiseki Viewing Stones', href: '#stones' }]} />
    </div></section>
    <section className="showcase__section"><h2>Seller input &amp; recovery</h2><div className="showcase__cards"><ImageUpload /><ImageUpload state="Error" /><EmptyState /></div></section>
    <section className="showcase__section"><h2>Details &amp; offer dialog</h2><div className="showcase__split">
      <SpecimenDetails title="Kohaku" price="$2,400" seller="Mizuho Koi House · Sonoma, CA" description="Red and white patterning, viewed from above. Confirm condition and handover details with the seller." facts={[{ label: 'Length & age', value: '54 cm · 3 years' }, { label: 'Breeder', value: 'Not provided' }, { label: 'Handover', value: 'Pondside collection' }]} saved={saved} onSave={() => setSaved(!saved)} onMakeOffer={() => setDialogOpen(true)} />
      <div className="showcase__stack"><FactRow label="Length & age" value="54 cm · 3 years" /><Button label="Open offer dialog" onClick={() => setDialogOpen(true)} /><OfferForm askingPrice="$2,400" specimen="Kohaku" reference="N° 01" handoverOptions={handover} onSubmit={async () => { await new Promise(resolve => setTimeout(resolve, 500)); }} /></div>
    </div></section>
    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Propose an offer" body={<OfferForm askingPrice="$2,400" specimen="Kohaku" reference="N° 01" handoverOptions={handover} onSubmit={async () => { setDialogOpen(false); }} />} />
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
