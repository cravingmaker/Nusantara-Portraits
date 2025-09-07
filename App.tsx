/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCulturalImage, getCulturalInformation } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import CultureSelector from './components/CultureSelector';
import CulturalInfoModal from './components/CulturalInfoModal';
import { createAlbumPage } from './lib/albumUtils';
import Footer from './components/Footer';
import { cn } from './lib/utils';

const PROVINCES: Record<string, { activity: string, location: string }[]> = {
    Aceh: [
        { activity: 'Performing the Saman dance', location: 'a Gayo highlands village' },
        { activity: 'Drinking Gayo coffee', location: 'a traditional coffee house in Takengon' },
        { activity: 'Visiting the Baiturrahman Grand Mosque', location: 'the heart of Banda Aceh' },
        { activity: 'Surfing the waves', location: 'the pristine shores of Pulau Simeulue' },
        { activity: 'Exploring the underwater park', location: 'the coast of Sabang' },
        { activity: 'Making Kueh Seupet pastries', location: 'a local family kitchen' },
    ],
    Bali: [
        { activity: 'Performing the Kecak dance', location: 'Uluwatu temple at sunset' },
        { activity: 'Carrying offerings', location: 'a procession to a temple' },
        { activity: 'Planting rice', location: 'the Tegalalang rice terraces' },
        { activity: 'Learning traditional painting', location: 'an artist village in Ubud' },
        { activity: 'Joining a Barong dance', location: 'a local community stage' },
        { activity: 'Surfing at Kuta Beach', location: 'the famous shores of Kuta' },
    ],
    'Bangka Belitung Islands': [
        { activity: 'Exploring the granite beaches', location: 'Tanjung Tinggi in Belitung' },
        { activity: 'Visiting the Andrea Hirata Word Museum', location: 'the birthplace of Laskar Pelangi' },
        { activity: 'Diving around Lengkuas Island', location: 'the historic lighthouse' },
        { activity: 'Seeing the surreal Kaolin Lake', location: 'a former mining site' },
        { activity: 'Tasting Mie Bangka', location: 'a local culinary stall' },
        { activity: 'Exploring traditional Malay stilt houses', location: 'a coastal village' },
    ],
    Banten: [
        { activity: 'Visiting the Baduy tribe', location: 'their remote village in the highlands' },
        { activity: 'Exploring Ujung Kulon National Park', location: 'a Javan rhinoceros habitat' },
        { activity: 'Watching a Debus martial arts performance', location: 'a display of immunity' },
        { activity: 'Relaxing on Anyer beach', location: 'a view of Mount Krakatoa' },
        { activity: 'Visiting the Great Mosque of Banten', location: 'the historic Sultanate\'s mosque' },
        { activity: 'Crossing a historic suspension bridge', location: 'the heart of Old Banten' },
    ],
    Bengkulu: [
        { activity: 'Visiting the historic Fort Marlborough', location: 'the coastal defenses' },
        { activity: 'Seeing a Rafflesia arnoldii flower bloom', location: 'the deep rainforest' },
        { activity: 'Surfing at Panjang Beach', location: 'the Indian Ocean coastline' },
        { activity: 'Exploring the Bukit Kaba volcano crater', location: 'the active volcano summit' },
        { activity: 'Participating in a Tabot festival', location: 'a vibrant cultural parade' },
        { activity: 'Enjoying a cup of Bengkulu coffee', location: 'a local coffee shop' },
    ],
    'Central Java': [
        { activity: 'Making Batik', location: 'a workshop near Borobudur' },
        { activity: 'Playing the Gamelan', location: 'a royal hall in Surakarta' },
        { activity: 'Watching a Wayang Kulit shadow puppet show', location: 'a traditional theater' },
        { activity: 'Exploring Prambanan Temple', location: 'the ancient Hindu temple complex' },
        { activity: 'Climbing Mount Merapi at dawn', location: 'the active volcano\'s slope' },
        { activity: 'Serving Tumpeng rice', location: 'a ceremonial feast' },
    ],
    'Central Kalimantan': [
        { activity: 'Navigating Tanjung Puting National Park', location: 'a research camp for orangutans' },
        { activity: 'Cruising on a Klotok boat', location: 'the jungle-lined Sekonyer River' },
        { activity: 'Attending an Isen Mulang cultural festival', location: 'a celebration in Palangka Raya' },
        { activity: 'Exploring the Sebangau National Park', location: 'a peat-swamp forest' },
        { activity: 'Visiting a traditional Dayak longhouse', location: 'a community by the river' },
        { activity: 'Learning Dayak Ngaju weaving', location: 'a local artisan workshop' },
    ],
    'Central Papua': [
        { activity: 'Trekking towards Carstensz Pyramid', location: 'the highest peak in Oceania' },
        { activity: 'Exploring the Wissel Lakes region', location: 'the highland lakes' },
        { activity: 'Visiting a Moni or Ekari tribe village', location: 'the central highlands' },
        { activity: 'Learning to use a Noken bag', location: 'a traditional handmade bag' },
        { activity: 'Panning for gold', location: 'a traditional mining area' },
        { activity: 'Seeing unique highland flora and fauna', location: 'the remote mountain trails' },
    ],
    'Central Sulawesi': [
        { activity: 'Exploring the megaliths of Bada Valley', location: 'ancient stone carvings' },
        { activity: 'Diving in the Togean Islands', location: 'a pristine coral reef' },
        { activity: 'Visiting Lake Poso', location: 'one of Indonesia\'s deepest lakes' },
        { activity: 'Seeing the Dero circle dance', location: 'a community gathering' },
        { activity: 'Exploring Morowali Nature Reserve', location: 'the unique ecosystem' },
        { activity: 'Trekking in Lore Lindu National Park', location: 'a UNESCO Biosphere Reserve' },
    ],
    'East Java': [
        { activity: 'Watching the sunrise over Mount Bromo', location: 'a viewpoint on the caldera' },
        { activity: 'Exploring Ijen crater\'s blue fire', location: 'a volcanic phenomenon at night' },
        { activity: 'Attending a Reog Ponorogo performance', location: 'a vibrant cultural show' },
        { activity: 'Visiting the ancient temples of Trowulan', location: 'the former Majapahit capital' },
        { activity: 'Surfing at G-Land Plengkung Beach', location: 'a world-famous surf break' },
        { activity: 'Enjoying Rawon', location: 'a traditional restaurant in Surabaya' },
    ],
    'East Kalimantan': [
        { activity: 'Seeing freshwater dolphins', location: 'the Mahakam River' },
        { activity: 'Exploring the Derawan Islands', location: 'swimming with turtles and manta rays' },
        { activity: 'Visiting a Dayak Kenyah longhouse', location: 'the cultural village of Pampang' },
        { activity: 'Attending an Erau festival', location: 'a vibrant cultural celebration' },
        { activity: 'Exploring the rainforest', location: 'Kutai National Park' },
        { activity: 'Seeing the future capital city site', location: 'Nusantara' },
    ],
    'East Nusa Tenggara': [
        { activity: 'Seeing Komodo dragons', location: 'the wild on Komodo Island' },
        { activity: 'Swimming on Pink Beach', location: 'the unique pink sand shore' },
        { activity: 'Visiting the tri-colored lakes of Mount Kelimutu', location: 'Flores island' },
        { activity: 'Exploring the traditional village of Wae Rebo', location: 'the cone-shaped houses' },
        { activity: 'Diving in the Alor archipelago', location: 'a world-class dive site' },
        { activity: 'Watching a Caci whip fight dance', location: 'a traditional Manggarai ceremony' },
    ],
    Gorontalo: [
        { activity: 'Swimming with whale sharks', location: 'the village of Botubarani' },
        { activity: 'Diving at Olele Marine Park', location: 'seeing Salvador Dali sponges' },
        { activity: 'Exploring the Otanaha Fortress', location: 'a historic hilltop fort' },
        { activity: 'Visiting the sacred Bubohu mosque', location: 'an ancient religious site' },
        { activity: 'Harvesting corn with local farmers', location: 'the fertile fields' },
        { activity: 'Enjoying Binte Biluhuta soup', location: 'a traditional corn soup' },
    ],
    'Highland Papua': [
        { activity: 'Attending a mock battle with the Yali tribe', location: 'a cultural demonstration' },
        { activity: 'Exploring the highlands around Wamena', location: 'the Baliem Valley' },
        { activity: 'Seeing the ancient mummy of Jiwika', location: 'a well-preserved ancestor' },
        { activity: 'Participating in a pig feast ceremony', location: 'a major cultural event' },
        { activity: 'Crossing a traditional suspension bridge', location: 'a river gorge' },
        { activity: 'Cultivating sweet potatoes', location: 'a mountain garden' },
    ],
    Jakarta: [
        { activity: 'Performing with Ondel-Ondel figures', location: 'a bustling Jakarta street festival' },
        { activity: 'Making Kerak Telor', location: 'a street food stall in Kota Tua' },
        { activity: 'Exploring Kota Tua with old-fashioned bikes', location: 'Fatahillah Square' },
        { activity: 'Visiting Sunda Kelapa harbor', location: 'the historic port with phinisi ships' },
        { activity: 'Enjoying the view from the Monas', location: 'the National Monument' },
        { activity: 'Practicing Pencak Silat', location: 'a courtyard in old Batavia' },
    ],
    Jambi: [
        { activity: 'Exploring the Muaro Jambi Temple Complex', location: 'the ancient university grounds' },
        { activity: 'Canoeing on the tranquil Lake Kaco', location: 'a hidden forest lake' },
        { activity: 'Visiting Mount Kerinci', location: 'the highest volcano in Indonesia' },
        { activity: 'Performing the Sekapur Sirih welcome dance', location: 'a formal ceremony' },
        { activity: 'Trying local Jambi coffee', location: 'a plantation in the highlands' },
        { activity: 'Discovering megaliths', location: 'Kerinci Seblat National Park' },
    ],
    Lampung: [
        { activity: 'Snorkeling at Pahawang Island', location: 'the clear turquoise waters' },
        { activity: 'Visiting Way Kambas National Park', location: 'an elephant conservation center' },
        { activity: 'Watching a Sigeh Penguten dance', location: 'a traditional welcoming ceremony' },
        { activity: 'Exploring Kiluan Bay for dolphins', location: 'a boat on the open sea' },
        { activity: 'Climbing the Anak Krakatoa volcano', location: 'the Sunda Strait' },
        { activity: 'Enjoying Lampung\'s robusta coffee', location: 'a local plantation' },
    ],
    Maluku: [
        { activity: 'Diving in the Banda Islands', location: 'the historic spice gardens' },
        { activity: 'Exploring Ambon\'s historical forts', location: 'the remnants of the colonial era' },
        { activity: 'Relaxing on the white sands of Ora Beach', location: 'a secluded paradise' },
        { activity: 'Watching a Cakalele war dance', location: 'a fierce traditional performance' },
        { activity: 'Enjoying Papeda with yellow fish soup', location: 'a staple Malukan dish' },
        { activity: 'Visiting the Siwa Lima Museum', location: 'learning about local culture' },
    ],
    'North Kalimantan': [
        { activity: 'Exploring Kayan Mentarang National Park', location: 'the vast protected rainforest' },
        { activity: 'Navigating the rapids of the Kayan River', location: 'a thrilling boat journey' },
        { activity: 'Visiting the Malinau cultural center', location: 'learning about local tribes' },
        { activity: 'Seeing the traditional Lundayeh dance', location: 'a community performance' },
        { activity: 'Exploring the mangrove forests', location: 'the coast of Tarakan' },
        { activity: 'Discovering ancient rock art', location: 'the mountains near the border' },
    ],
    'North Maluku': [
        { activity: 'Exploring the volcanic islands', location: 'Ternate and Tidore' },
        { activity: 'Diving for shipwrecks', location: 'the waters around Morotai' },
        { activity: 'Visiting Fort Tolukko', location: 'a Portuguese colonial fort' },
        { activity: 'Seeing the Soya-Soya dance', location: 'a traditional war dance' },
        { activity: 'Climbing Mount Gamalama', location: 'the active volcano' },
        { activity: 'Discovering the history of the spice trade', location: 'a historic plantation' },
    ],
    'North Sulawesi': [
        { activity: 'Diving in Bunaken National Marine Park', location: 'the incredible coral walls' },
        { activity: 'Climbing the active Mount Lokon', location: 'the highlands of Tomohon' },
        { activity: 'Seeing tarsiers in Tangkoko Nature Reserve', location: 'the world\'s smallest primates' },
        { activity: 'Attending a Kabasaran war dance performance', location: 'a Minahasan ceremony' },
        { activity: 'Exploring Lake Tondano', location: 'the volcanic crater lake' },
        { activity: 'Eating Tinutuan porridge', location: 'a traditional Manado breakfast' },
    ],
    'North Sumatra': [
        { activity: 'Jumping over stones (Lompat Batu)', location: 'Bawomataluo village in Nias' },
        { activity: 'Visiting Lake Toba', location: 'the scenic Samosir Island' },
        { activity: 'Seeing orangutans', location: 'the jungles of Bukit Lawang' },
        { activity: 'Attending a Batak Toba wedding', location: 'a traditional ceremony' },
        { activity: 'Exploring Sipisopiso waterfall', location: 'the magnificent gorge' },
        { activity: 'Eating durian', location: 'a bustling market in Medan' },
    ],
    Papua: [
        { activity: 'Trekking in the Baliem Valley', location: 'living with the Dani tribe' },
        { activity: 'Exploring Lorentz National Park', location: 'a UNESCO World Heritage Site' },
        { activity: 'Watching a traditional Papuan welcome dance', location: 'a village ceremony' },
        { activity: 'Seeing the bird-of-paradise', location: 'the deep jungle' },
        { activity: 'Visiting Lake Sentani', location: 'the stilt villages on the lake' },
        { activity: 'Discovering ancient rock paintings', location: 'a remote cliff face' },
    ],
    Riau: [
        { activity: 'Surfing the Bono tidal bore', location: 'the Kampar River' },
        { activity: 'Exploring Muara Takus temple', location: 'the ancient Buddhist complex' },
        { activity: 'Weaving traditional Tenun Siak fabric', location: 'a royal workshop' },
        { activity: 'Performing a Malay Zapin dance', location: 'a cultural festival' },
        { activity: 'Crossing the Siak Sri Indrapura Bridge', location: 'the city of Pekanbaru' },
        { activity: 'Tasting Gulai Ikan Patin', location: 'a riverside restaurant' },
    ],
    'Riau Islands': [
        { activity: 'Relaxing on Bintan Island resorts', location: 'a beautiful private beach' },
        { activity: 'Exploring Penyengat Island\'s historical sites', location: 'the old Malay kingdom' },
        { activity: 'Diving in the Anambas Islands', location: 'a remote marine paradise' },
        { activity: 'Enjoying fresh seafood', location: 'a waterfront restaurant in Batam' },
        { activity: 'Visiting the Vihara Ksitigarbha Bodhisattva', location: 'the thousand-face temple' },
        { activity: 'Watching a Mak Yong theater performance', location: 'a traditional stage' },
    ],
    'South Kalimantan': [
        { activity: 'Visiting the Lok Baintan floating market', location: 'a bustling river market at dawn' },
        { activity: 'Exploring the diamond mines', location: 'the traditional mines of Martapura' },
        { activity: 'Seeing proboscis monkeys', location: 'the mangrove forests of Pulau Kaget' },
        { activity: 'Watching a Banjar Baksa Kembang dance', location: 'a royal court performance' },
        { activity: 'Eating Soto Banjar', location: 'a famous local dish' },
        { activity: 'Bamboo rafting in Loksado', location: 'the Amandit river' },
    ],
    'South Papua': [
        { activity: 'Exploring Wasur National Park', location: 'the "Serengeti of Papua"' },
        { activity: 'Visiting the Asmat tribe', location: 'learning about their woodcarvings' },
        { activity: 'Navigating the wetlands with a longboat', location: 'the vast river systems' },
        { activity: 'Attending an Asmat cultural festival', location: 'a showcase of art and tradition' },
        { activity: 'Seeing giant termite mounds', location: 'the unique landscape' },
        { activity: 'Fishing for barramundi', location: 'a local fishing spot' },
    ],
    'South Sulawesi': [
        { activity: 'Attending a Rambu Solo funeral ceremony', location: 'the highlands of Tana Toraja' },
        { activity: 'Exploring the hanging graves of Lemo', location: 'the cliffside burial sites' },
        { activity: 'Sailing on a traditional Phinisi schooner', location: 'the waters near Bulukumba' },
        { activity: 'Diving at Samalona Island', location: 'a small island off Makassar' },
        { activity: 'Watching a Pakarena fan dance', location: 'a graceful Gowa performance' },
        { activity: 'Eating Coto Makassar', location: 'a traditional eatery' },
    ],
    'South Sumatra': [
        { activity: 'Watching a traditional boat race', location: 'the iconic Musi River' },
        { activity: 'Eating Pempek by the Ampera Bridge', location: 'a famous landmark in Palembang' },
        { activity: 'Exploring Pagar Alam tea plantations', location: 'the cool highlands' },
        { activity: 'Wearing traditional Aesan Gede attire', location: 'a Palembang wedding' },
        { activity: 'Visiting the Kemaro Island pagoda', location: 'a delta in the Musi River' },
        { activity: 'Discovering ancient megalithic sites', location: 'the Pasemah Plateau' },
    ],
    'Southeast Sulawesi': [
        { activity: 'Diving in Wakatobi National Park', location: 'a world-renowned marine park' },
        { activity: 'Exploring the underwater caves', location: 'the area around Bau-Bau' },
        { activity: 'Visiting the Labengki Island', location: 'a "mini Raja Ampat"' },
        { activity: 'Relaxing on Nirwana Beach', location: 'the beautiful coastline' },
        { activity: 'Watching a Lulo dance', location: 'a traditional group dance' },
        { activity: 'Discovering the Buton Fortress', location: 'the world\'s largest fortress' },
    ],
    'Southwest Papua': [
        { activity: 'Exploring the Misool Eco Resort area', location: 'a pristine part of Raja Ampat' },
        { activity: 'Discovering ancient petroglyphs', location: 'the cave walls of Misool' },
        { activity: 'Swimming in a jellyfish lake', location: 'a stingless jellyfish sanctuary' },
        { activity: 'Visiting the "Blue River" of Kali Biru', location: 'the crystal-clear river water' },
        { activity: 'Seeing the Gale-Gale dance', location: 'a traditional performance' },
        { activity: 'Kayaking through mangrove forests', location: 'the coastal ecosystem' },
    ],
    'West Java': [
        { activity: 'Playing the Angklung', location: 'Saung Angklung Udjo in Bandung' },
        { activity: 'Exploring Kawah Putih crater lake', location: 'the surreal volcanic landscape' },
        { activity: 'Surfing at Cimaja Beach', location: 'the coast of Pelabuhan Ratu' },
        { activity: 'Performing a Sundanese Jaipongan dance', location: 'a cultural gathering' },
        { activity: 'Eating Batagor', location: 'a famous food stall in Bandung' },
        { activity: 'Visiting the Bogor Botanical Gardens', location: 'the presidential palace grounds' },
    ],
    'West Kalimantan': [
        { activity: 'Cruising down the Kapuas River', location: 'the longest river in Indonesia' },
        { activity: 'Visiting the Equator Monument', location: 'the city of Pontianak' },
        { activity: 'Exploring Danau Sentarum National Park', location: 'a vast wetland area' },
        { activity: 'Attending a Gawai Dayak harvest festival', location: 'a traditional longhouse' },
        { activity: 'Seeing the Tidayu cultural blend', location: 'a community in Singkawang' },
        { activity: 'Eating Bubur Pedas', location: 'a traditional spicy porridge stall' },
    ],
    'West Nusa Tenggara': [
        { activity: 'Climbing Mount Rinjani', location: 'the majestic volcano in Lombok' },
        { activity: 'Relaxing on the Gili Islands', location: 'a swing over the ocean' },
        { activity: 'Watching a Peresean stick fighting match', location: 'a Sasak cultural event' },
        { activity: 'Weaving traditional Sasak textiles', location: 'the village of Sade' },
        { activity: 'Surfing at Desert Point', location: 'a legendary surf break' },
        { activity: 'Exploring Moyo Island\'s waterfalls', location: 'the island of Sumbawa' },
    ],
    'West Papua': [
        { activity: 'Diving and snorkeling in Raja Ampat', location: 'the heart of the Coral Triangle' },
        { activity: 'Exploring the karst islands of Wayag', location: 'a breathtaking viewpoint' },
        { activity: 'Visiting a traditional village', location: 'the community of Arborek Island' },
        { activity: 'Birdwatching for the Wilson\'s Bird-of-Paradise', location: 'the rainforest canopy' },
        { activity: 'Cruising through Triton Bay', location: 'a remote and biodiverse area' },
        { activity: 'Seeing the Tari Yospan dance', location: 'a lively social dance' },
    ],
    'West Sulawesi': [
        { activity: 'Weaving Mandar silk', location: 'a traditional artisan\'s home' },
        { activity: 'Sailing on a Sandeq boat', location: 'the straits of Mandar' },
        { activity: 'Exploring the beaches of Manakara', location: 'the pristine coastline' },
        { activity: 'Enjoying the Pattudu dance', location: 'a cultural performance' },
        { activity: 'Hiking in the Gandang Dewata mountains', location: 'the national park' },
        { activity: 'Tasting Jepa', location: 'the local cassava flatbread' },
    ],
    'West Sumatra': [
        { activity: 'Pacu Jawi cow racing', location: 'a muddy rice field in West Sumatra' },
        { activity: 'Performing the Tari Piring dance', location: 'a traditional Rumah Gadang' },
        { activity: 'Weaving Pandai Sikek cloth', location: 'a local weaving village' },
        { activity: 'Standing by Lake Maninjau', location: 'the scenic caldera lake' },
        { activity: 'Preparing Rendang', location: 'an outdoor kitchen for a feast' },
        { activity: 'Exploring Harau Valley', location: 'the towering rock formations' },
    ],
    Yogyakarta: [
        { activity: 'Exploring the Kraton palace', location: 'the Sultan\'s residence' },
        { activity: 'Visiting Taman Sari water castle', location: 'the royal garden' },
        { activity: 'Seeing the sunrise at Borobudur Temple', location: 'the magnificent monument' },
        { activity: 'Creating silver crafts', location: 'the workshops of Kotagede' },
        { activity: 'Joining a Jathilan horse dance', location: 'a village square' },
        { activity: 'Eating Gudeg', location: 'a traditional lesehan stall on Malioboro street' },
    ],
};

const PROVINCE_NAMES = Object.keys(PROVINCES).sort();


// Pre-defined positions for a scattered look on desktop
const POSITIONS = [
    { top: '5%', left: '10%', rotate: -8 },
    { top: '15%', left: '60%', rotate: 5 },
    { top: '45%', left: '5%', rotate: 3 },
    { top: '2%', left: '35%', rotate: 10 },
    { top: '40%', left: '70%', rotate: -12 },
    { top: '50%', left: '38%', rotate: -3 },
];

const GHOST_POLAROIDS_CONFIG = [
  { initial: { x: "-150%", y: "-100%", rotate: -30 }, transition: { delay: 0.2 } },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  { initial: { x: "-120%", y: "120%", rotate: 45 }, transition: { delay: 0.6 } },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];


type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

interface ActivityImages {
    images: GeneratedImage[];
    currentIndex: number;
}

interface InfoModalState {
    isOpen: boolean;
    isLoading: boolean;
    title: string;
    content: string;
    error: string | null;
}


const primaryButtonClasses = "font-permanent-marker text-lg text-center text-white bg-[#AE2012] backdrop-blur-sm border-2 border-[#9B2226] py-2 px-6 rounded-sm transform transition-all duration-200 hover:scale-105 hover:-rotate-2 hover:bg-[#9B2226]";
const secondaryButtonClasses = "font-permanent-marker text-lg text-center text-[#AE2012] bg-white/50 backdrop-blur-sm border-2 border-[#AE2012] py-2 px-6 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-[#AE2012] hover:text-white";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, Record<string, ActivityImages>>>({});
    const [selectedProvince, setSelectedProvince] = useState<string>(PROVINCE_NAMES[0]);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [hoveredCaption, setHoveredCaption] = useState<string | null>(null);
    const [hoveredImageUrl, setHoveredImageUrl] = useState<string | null>(null);
    const [isHeaderInverted, setIsHeaderInverted] = useState(false);
    const [infoModalState, setInfoModalState] = useState<InfoModalState>({
        isOpen: false,
        isLoading: false,
        title: '',
        content: '',
        error: null,
    });
    const dragAreaRef = useRef<HTMLDivElement>(null);
    const [draggedCard, setDraggedCard] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Use refs to hold the latest state for stable callbacks, preventing unnecessary re-renders.
    const uploadedImageRef = useRef(uploadedImage);
    uploadedImageRef.current = uploadedImage;

    const generatedImagesRef = useRef(generatedImages);
    generatedImagesRef.current = generatedImages;

    const originalSubtitle = "Your face, Indonesia's heritage. A cultural photo journey.";

    const handleCardHover = (caption: string, imageUrl?: string) => {
        if (!isMobile) {
            setHoveredCaption(caption);
            if (imageUrl) {
                setHoveredImageUrl(imageUrl);
                setIsHeaderInverted(true);
            }
        }
    };

    const handleCardLeave = () => {
        if (!isMobile) {
            setHoveredCaption(null);
            setHoveredImageUrl(null);
            setIsHeaderInverted(false);
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImages({}); // Clear all previous results
                setSelectedProvince(PROVINCE_NAMES[0]); // Reset to first province
            };
            reader.readAsDataURL(file);
        }
    };

    const generateImagesForProvince = useCallback(async (provinceName: string) => {
        if (!uploadedImageRef.current) return;
        const currentUploadedImage = uploadedImageRef.current;


        const activities = PROVINCES[provinceName];
        if (!activities) return;

        // Set initial pending state for the new province
        setGeneratedImages(prev => {
            const newProvinceImages: Record<string, ActivityImages> = {};
            activities.forEach(activity => {
                // FIX: Explicitly cast 'pending' to ImageStatus to prevent TypeScript from widening its type to 'string'.
                newProvinceImages[activity.activity] = { images: [{ status: 'pending' as ImageStatus }], currentIndex: 0 };
            });
            return { ...prev, [provinceName]: newProvinceImages };
        });

        const concurrencyLimit = 2;
        const activitiesQueue = [...activities];

        const processActivity = async (activity: { activity: string, location: string }) => {
            try {
                const prompt = `Reimagine the person in this photo wearing a traditional ${provinceName} cultural costume while ${activity.activity} in ${activity.location}. The output must be a photorealistic, respectful, and beautiful image celebrating Indonesian culture.`;
                const resultUrl = await generateCulturalImage(currentUploadedImage, prompt, provinceName);
                setGeneratedImages(prev => ({
                    ...prev,
                    [provinceName]: {
                        ...prev[provinceName],
                        [activity.activity]: {
                            ...prev[provinceName][activity.activity],
                            images: [{ status: 'done', url: resultUrl }],
                        },
                    },
                }));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages(prev => ({
                    ...prev,
                    [provinceName]: {
                        ...prev[provinceName],
                        [activity.activity]: {
                             ...prev[provinceName][activity.activity],
                            images: [{ status: 'error', error: errorMessage }],
                        },
                    },
                }));
                console.error(`Failed to generate image for ${provinceName} - ${activity.activity}:`, err);
            }
        };

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (activitiesQueue.length > 0) {
                const activity = activitiesQueue.shift();
                if (activity) {
                    await processActivity(activity);
                }
            }
        });

        await Promise.all(workers);
    }, []);

    const handleGenerateClick = async () => {
        setAppState('generating');
        await generateImagesForProvince(selectedProvince);
        setAppState('results-shown');
    };

    const handleSelectProvince = useCallback((provinceName: string) => {
        setSelectedProvince(provinceName);
        if (!generatedImagesRef.current[provinceName]) {
            generateImagesForProvince(provinceName);
        }
    }, [generateImagesForProvince]);

    const handleRefreshImage = async (activityName: string) => {
        if (!uploadedImage) return;

        const activityData = generatedImages[selectedProvince]?.[activityName];
        if (!activityData || activityData.images[activityData.currentIndex]?.status === 'pending') return;
        
        console.log(`Refreshing image for ${selectedProvince} - ${activityName} at index ${activityData.currentIndex}...`);

        const activity = PROVINCES[selectedProvince].find(a => a.activity === activityName);
        if (!activity) return;

        setGeneratedImages(prev => {
            const newImages = [...prev[selectedProvince][activityName].images];
            // FIX: Explicitly cast 'pending' to ImageStatus to prevent TypeScript from widening its type to 'string'.
            newImages[activityData.currentIndex] = { status: 'pending' as ImageStatus };
            return {
                ...prev,
                [selectedProvince]: {
                    ...prev[selectedProvince],
                    [activityName]: { ...prev[selectedProvince][activityName], images: newImages },
                },
            };
        });

        try {
            const prompt = `Reimagine the person in this photo wearing a traditional ${selectedProvince} cultural costume while ${activity.activity} in ${activity.location}. The output must be a photorealistic, respectful, and beautiful image celebrating Indonesian culture.`;
            const resultUrl = await generateCulturalImage(uploadedImage, prompt, selectedProvince);
            setGeneratedImages(prev => {
                const newImages = [...prev[selectedProvince][activityName].images];
                newImages[activityData.currentIndex] = { status: 'done', url: resultUrl };
                return {
                     ...prev,
                    [selectedProvince]: {
                        ...prev[selectedProvince],
                        [activityName]: { ...prev[selectedProvince][activityName], images: newImages },
                    },
                };
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => {
                 const newImages = [...prev[selectedProvince][activityName].images];
                newImages[activityData.currentIndex] = { status: 'error', error: errorMessage };
                return {
                     ...prev,
                    [selectedProvince]: {
                        ...prev[selectedProvince],
                        [activityName]: { ...prev[selectedProvince][activityName], images: newImages },
                    },
                };
            });
            console.error(`Failed to refresh image for ${activityName}:`, err);
        }
    };
    
    const handlePrevImage = (activityName: string) => {
        setGeneratedImages(prev => {
            const activity = prev[selectedProvince]?.[activityName];
            if (!activity || activity.currentIndex <= 0) return prev;

            return {
                ...prev,
                [selectedProvince]: {
                    ...prev[selectedProvince],
                    [activityName]: {
                        ...activity,
                        currentIndex: activity.currentIndex - 1
                    }
                }
            };
        });
    };

    const generateImageVariation = async (activityName: string) => {
        const activityData = generatedImages[selectedProvince]?.[activityName];
        if (!activityData) return;

        const currentImage = activityData.images[activityData.currentIndex];
        // Use the current image if available, otherwise fall back to the original upload.
        const sourceImageUrl = (currentImage?.status === 'done' && currentImage.url) ? currentImage.url : uploadedImage;

        if (!sourceImageUrl) {
            console.error("No source image available to generate a variation.");
            return;
        }

        const activity = PROVINCES[selectedProvince].find(a => a.activity === activityName);
        if (!activity) return;

        setGeneratedImages(prev => {
            const currentActivity = prev[selectedProvince][activityName];
            // FIX: Explicitly cast 'pending' to ImageStatus to prevent TypeScript from widening its type to 'string'.
            const newImages = [...currentActivity.images, { status: 'pending' as ImageStatus }];
            return {
                ...prev,
                [selectedProvince]: {
                    ...prev[selectedProvince],
                    [activityName]: {
                        images: newImages,
                        currentIndex: newImages.length - 1
                    }
                }
            };
        });

        try {
            const prompt = `Based on the person in the input image, generate a new version. It is crucial that the person's facial features, hairstyle, and the exact design of their traditional ${selectedProvince} costume remain completely consistent. The only change should be the camera's point of view or the person's pose while they are ${activity.activity} in ${activity.location}. The image must be photorealistic, respectful, and beautifully celebrate Indonesian culture.`;
            const resultUrl = await generateCulturalImage(sourceImageUrl, prompt, selectedProvince);
            setGeneratedImages(prev => {
                const currentActivity = prev[selectedProvince][activityName];
                const newImages = [...currentActivity.images];
                newImages[newImages.length - 1] = { status: 'done', url: resultUrl };
                return {
                     ...prev,
                    [selectedProvince]: {
                        ...prev[selectedProvince],
                        [activityName]: { ...currentActivity, images: newImages },
                    },
                };
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
             setGeneratedImages(prev => {
                const currentActivity = prev[selectedProvince][activityName];
                const newImages = [...currentActivity.images];
                newImages[newImages.length - 1] = { status: 'error', error: errorMessage };
                 return {
                    ...prev,
                    [selectedProvince]: {
                        ...prev[selectedProvince],
                        [activityName]: { ...currentActivity, images: newImages },
                    },
                };
            });
            console.error(`Failed to generate new variation for ${activityName}:`, err);
        }
    };

    const handleNextImage = (activityName: string) => {
        const activityData = generatedImages[selectedProvince]?.[activityName];
        if (!activityData) return;

        if (activityData.currentIndex < activityData.images.length - 1) {
            setGeneratedImages(prev => ({
                ...prev,
                [selectedProvince]: {
                    ...prev[selectedProvince],
                    [activityName]: {
                        ...activityData,
                        currentIndex: activityData.currentIndex + 1
                    }
                }
            }));
            return;
        }
        generateImageVariation(activityName);
    };

    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImages({});
        setAppState('idle');
        setSelectedProvince(PROVINCE_NAMES[0]);
    };

    const handleDownloadIndividualImage = (activityName: string) => {
        const activityData = generatedImages[selectedProvince]?.[activityName];
        const image = activityData?.images[activityData.currentIndex];
        if (image?.status === 'done' && image.url) {
            const link = document.createElement('a');
            link.href = image.url;
            link.download = `nusantara-portraits-${selectedProvince.toLowerCase().replace(/\s/g, '-')}-${activityName.toLowerCase().replace(/\s/g, '-')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownloadAlbum = async () => {
        setIsDownloading(true);
        try {
            const currentProvinceImages = generatedImages[selectedProvince];
            if (!currentProvinceImages) {
                alert("Images for the selected province are not available.");
                return;
            }

            const imageData: Record<string, string> = {};
            let allDone = true;
            PROVINCES[selectedProvince].forEach(activity => {
                const activityData = currentProvinceImages[activity.activity];
                const image = activityData?.images[activityData.currentIndex];
                if (image?.status === 'done' && image.url) {
                    imageData[`${activity.activity} - ${activity.location}`] = image.url;
                } else {
                    allDone = false;
                }
            });

            if (!allDone) {
                alert("Please wait for all images in this set to finish generating before downloading the album.");
                return;
            }

            const albumDataUrl = await createAlbumPage(imageData);

            const link = document.createElement('a');
            link.href = albumDataUrl;
            link.download = `nusantara-portraits-${selectedProvince.toLowerCase().replace(/\s/g, '-')}-album.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Failed to create or download album:", error);
            alert("Sorry, there was an error creating your album. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Nusantara Portraits',
            text: 'Create your own cultural photo journey with AI!',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop or browsers that don't support Web Share API
                await navigator.clipboard.writeText(shareData.url);
                alert('App link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Could not share or copy link. Please copy the URL from your browser\'s address bar.');
        }
    };

    const handleShowCulturalInfo = async (activityName: string) => {
        const activity = PROVINCES[selectedProvince]?.find(a => a.activity === activityName);
        if (!activity) return;

        setInfoModalState({
            isOpen: true,
            isLoading: true,
            title: `Discovering ${selectedProvince}...`,
            content: '',
            error: null,
        });

        try {
            const info = await getCulturalInformation(selectedProvince, activity.activity, activity.location);
            setInfoModalState({
                isOpen: true,
                isLoading: false,
                title: `${activity.activity}`,
                content: info,
                error: null,
            });
        } catch (err) {
            setInfoModalState({
                isOpen: true,
                isLoading: false,
                title: `Error`,
                content: '',
                error: err instanceof Error ? err.message : "An unknown error occurred while fetching information.",
            });
        }
    };

    const handleCloseInfoModal = () => {
        setInfoModalState(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only act when the results are shown or generating
            if (appState !== 'generating' && appState !== 'results-shown') {
                return;
            }

            // Don't interfere if the user is typing in an input field or the modal is open
            const target = event.target as HTMLElement;
            if (infoModalState.isOpen || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            const currentIndex = PROVINCE_NAMES.indexOf(selectedProvince);
            let newProvince: string | null = null;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                const newIndex = (currentIndex - 1 + PROVINCE_NAMES.length) % PROVINCE_NAMES.length;
                newProvince = PROVINCE_NAMES[newIndex];
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                const newIndex = (currentIndex + 1) % PROVINCE_NAMES.length;
                newProvince = PROVINCE_NAMES[newIndex];
            }

            if (newProvince) {
                handleSelectProvince(newProvince);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [appState, selectedProvince, handleSelectProvince, infoModalState.isOpen]);

    return (
        <main className="bg-gradient-to-b from-red-50 to-white text-neutral-800 h-screen w-full flex flex-col items-center p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-black/[0.05] z-0"></div>
            
            <AnimatePresence>
                {hoveredImageUrl && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 w-full h-full z-1"
                        style={{
                            backgroundImage: `url(${hoveredImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(100px) brightness(0.95) saturate(1.1)',
                            transform: 'scale(1.2)',
                        }}
                    />
                )}
            </AnimatePresence>

            <div className="z-10 flex flex-col items-center justify-center w-full flex-1">
                <div className="text-center mb-10 transition-colors duration-300">
                    <h1 className={cn(
                        "text-6xl md:text-8xl font-caveat font-bold transition-all duration-300",
                        isHeaderInverted ? 'text-white drop-shadow-lg' : 'text-[#9B2226]'
                    )}>
                        Nusantara Portraits
                    </h1>
                    <div className="relative h-8 mt-2 overflow-hidden">
                        <AnimatePresence>
                            <motion.p
                                key={hoveredCaption || originalSubtitle}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className={cn(
                                    "absolute inset-0 font-permanent-marker text-xl tracking-wide transition-all duration-300",
                                    isHeaderInverted ? 'text-neutral-200 drop-shadow-md' : 'text-neutral-600'
                                )}
                            >
                                {hoveredCaption || originalSubtitle}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                {appState === 'idle' && (
                     <div className="relative flex flex-col items-center justify-center w-full">
                        {GHOST_POLAROIDS_CONFIG.map((config, index) => (
                             <motion.div
                                key={index}
                                className="absolute w-80 h-[26rem] rounded-md p-4 bg-black/5 blur-sm"
                                initial={config.initial}
                                animate={{
                                    x: "0%", y: "0%", rotate: (Math.random() - 0.5) * 20,
                                    scale: 0,
                                    opacity: 0,
                                }}
                                transition={{ ...config.transition, ease: "circOut", duration: 2 }}
                            />
                        ))}
                        <motion.div
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 2, duration: 0.8, type: 'spring' }}
                             className="flex flex-col items-center"
                        >
                            <label htmlFor="file-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                 <PolaroidCard 
                                     caption="Click to begin"
                                     status="done"
                                 />
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                            <p className="mt-8 font-permanent-marker text-neutral-600 text-center max-w-xs text-lg">
                                Click the polaroid to upload your photo and start your cultural journey.
                            </p>
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <div className="flex flex-col items-center gap-6">
                         <PolaroidCard 
                            imageUrl={uploadedImage} 
                            caption="Your Photo" 
                            status="done"
                         />
                         <div className="flex items-center gap-4 mt-4">
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                Different Photo
                            </button>
                            <button onClick={handleGenerateClick} className={primaryButtonClasses}>
                                Generate
                            </button>
                         </div>
                    </div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && (
                     <>
                        {isMobile ? (
                            <div className="w-full flex items-center">
                                <div className="flex w-full overflow-x-auto space-x-8 p-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                                    {PROVINCES[selectedProvince].map((activity) => {
                                        const activityData = generatedImages[selectedProvince]?.[activity.activity];
                                        const currentImage = activityData?.images[activityData.currentIndex];
                                        return (
                                            <div key={activity.activity} className="flex-shrink-0 snap-center">
                                                <PolaroidCard
                                                    caption={`${activity.activity} in ${activity.location}`}
                                                    status={currentImage?.status || 'pending'}
                                                    imageUrl={currentImage?.url}
                                                    error={currentImage?.error}
                                                    onRegenerate={() => handleRefreshImage(activity.activity)}
                                                    onDownload={() => handleDownloadIndividualImage(activity.activity)}
                                                    onShowInfo={() => handleShowCulturalInfo(activity.activity)}
                                                    onNext={() => handleNextImage(activity.activity)}
                                                    onPrev={() => handlePrevImage(activity.activity)}
                                                    currentIndex={activityData?.currentIndex}
                                                    totalImages={activityData?.images.length}
                                                    isMobile={isMobile}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div ref={dragAreaRef} className="relative w-full flex-1 mt-4">
                                {PROVINCES[selectedProvince].map((activity, index) => {
                                    const { top, left, rotate } = POSITIONS[index];
                                    const activityData = generatedImages[selectedProvince]?.[activity.activity];
                                    const currentImage = activityData?.images[activityData.currentIndex];
                                    const caption = `${activity.activity} in ${activity.location}`;
                                    const isDragged = draggedCard === activity.activity;
                                    return (
                                        <motion.div
                                            key={activity.activity}
                                            className="absolute cursor-grab active:cursor-grabbing"
                                            style={{ top, left, zIndex: isDragged ? 10 : 'auto' }}
                                            initial={{ opacity: 0, scale: 0.5, y: 100, rotate: 0 }}
                                            animate={{ opacity: 1, scale: 1, y: 0, rotate: `${rotate}deg` }}
                                            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.15 }}
                                            onHoverStart={() => handleCardHover(caption, currentImage?.url)}
                                            onHoverEnd={handleCardLeave}
                                        >
                                            <PolaroidCard 
                                                dragConstraintsRef={dragAreaRef}
                                                caption={caption}
                                                status={currentImage?.status || 'pending'}
                                                imageUrl={currentImage?.url}
                                                error={currentImage?.error}
                                                onRegenerate={() => handleRefreshImage(activity.activity)}
                                                onDownload={() => handleDownloadIndividualImage(activity.activity)}
                                                onShowInfo={() => handleShowCulturalInfo(activity.activity)}
                                                onNext={() => handleNextImage(activity.activity)}
                                                onPrev={() => handlePrevImage(activity.activity)}
                                                currentIndex={activityData?.currentIndex}
                                                totalImages={activityData?.images.length}
                                                isMobile={isMobile}
                                                onDragStart={() => setDraggedCard(activity.activity)}
                                                onDragEnd={() => setDraggedCard(null)}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {(appState === 'generating' || appState === 'results-shown') && (
                <motion.div
                    className="fixed bottom-0 left-0 right-0 z-30"
                    initial="collapsed"
                    whileHover="expanded"
                    variants={{
                        collapsed: { y: 'calc(100% - 32px)' },
                        expanded: { y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                >
                    <div className="w-full bg-white/50 backdrop-blur-md rounded-t-lg border-t border-black/10 cursor-pointer">
                        <div className="w-full flex justify-center pt-2.5 pb-1">
                            <div className="w-20 h-1.5 bg-black/30 rounded-full"></div>
                        </div>
                        <div className="w-full max-w-6xl mx-auto">
                            <CultureSelector
                                provinces={PROVINCE_NAMES}
                                selectedProvince={selectedProvince}
                                onSelectProvince={handleSelectProvince}
                                generatedImages={generatedImages}
                                allProvincesData={PROVINCES}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
            
            <Footer />

            <CulturalInfoModal
                isOpen={infoModalState.isOpen}
                onClose={handleCloseInfoModal}
                title={infoModalState.title}
                content={infoModalState.content}
                isLoading={infoModalState.isLoading}
                error={infoModalState.error}
            />
        </main>
    );
}

export default App;