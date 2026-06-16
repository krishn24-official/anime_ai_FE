import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NewsItem } from '../../types';

interface NewsState {
  items: NewsItem[];
  categoryFilter: 'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series';
  selectedItemId: string | null;
}

const mockNews: NewsItem[] = [
  {
    id: 'n1',
    title: 'Demon Slayer: Infinity Castle Movie Trilogy Officially Confirmed',
    summary: 'ufotable announces that the epic final showdown of Demon Slayer will be adapted into a theatrical film trilogy.',
    content: 'ufotable has officially confirmed that the highly anticipated Infinity Castle arc will be adapted into a trilogy of theatrical feature films. The movies will depict the final battle between the Demon Slayer Corps and Muzan Kibutsuji, alongside his remaining Upper Rank demons. Fans worldwide are ecstatic, as the production values for ufotable films have historically set new industry standards. Release dates are yet to be announced, but teaser visuals have already sparked massive theories.',
    category: 'Anime',
    date: '2026-06-12',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    author: 'Aniplex Staff'
  },
  {
    id: 'n2',
    title: 'GTA VI: Brand New Trailer Showcases Advanced Physics & AI Systems',
    summary: 'Rockstar Games surprises fans with a new look at Vice City, emphasizing hyper-realistic crowd simulation and weather systems.',
    content: 'Rockstar Games has dropped a second trailer for Grand Theft Auto VI, focusing heavily on technical achievements. The trailer showcases stunning volumetric clouds, reactive water physics, and unprecedented NPC behavior systems where crowds react dynamically to events. Furthermore, Lucia and Jason’s dual protagonist gameplay elements were teased, hinting at coordinated heist mechanics. The release remains on track for late next year.',
    category: 'Games',
    date: '2026-06-11',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    author: 'Gamer Insider'
  },
  {
    id: 'n3',
    title: 'Solo Leveling Season 2 Gets Winter 2026 Release Window',
    summary: 'The hit anime adaption Solo Leveling: Arise from the Shadow returns with higher stakes and Jinwoo’s new powers.',
    content: 'A-1 Pictures has officially announced that Solo Leveling Season 2: Arise from the Shadow will premiere in Winter 2026. Following the massive success of the first season, the sequel will follow Sung Jinwoo as he descends deeper into S-Rank dungeons and continues raising his shadow army. A new key visual featuring Jinwoo surrounded by Igris and his newest shadows has been released to immense fan hype.',
    category: 'Anime',
    date: '2026-06-10',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    author: 'Crunchyroll News'
  },
  {
    id: 'n4',
    title: 'Spider-Man 4 Directed by Destin Daniel Cretton Set for July 2026',
    summary: 'Marvel Studios and Sony confirm the new director and official summer release date for Tom Holland’s next outing.',
    content: 'It is official: the next Spider-Man movie starring Tom Holland will be directed by Shang-Chi director Destin Daniel Cretton. Marvel Studios and Sony Pictures confirmed the project is fast-tracked for a July 2026 release. Rumors suggest the film will deal with the multiverse aftermath while keeping a street-level tone featuring Daredevil. Filming is expected to begin early next year in Atlanta.',
    category: 'Movies',
    date: '2026-06-09',
    image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    author: 'Hollywood Reporter'
  },
  {
    id: 'n5',
    title: 'The Last of Us Season 2 Teaser Highlights Abby and Jackson Siege',
    summary: 'HBO releases the first full look at Kaitlyn Dever as Abby in the highly anticipated second season.',
    content: 'HBO has unveiled the first teaser trailer for The Last of Us Season 2. The footage gives fans a chilling look at Kaitlyn Dever as Abby Anderson, alongside returning stars Pedro Pascal as Joel and Bella Ramsey as Ellie. The teaser highlights key moments from the Jackson settlement siege and the dark, rainy atmosphere of Seattle. The series is confirmed to debut in Spring 2026, adapting the controversial and emotional events of Part II.',
    category: 'TV-Series',
    date: '2026-06-08',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    author: 'HBO PR'
  },
  {
    id: 'n6',
    title: 'Elden Ring DLC Shadow of the Erdtree Passes 10 Million Copies Sold',
    summary: 'FromSoftware celebrates a massive sales milestone for the expansion within just a few weeks of launch.',
    content: 'FromSoftware and Bandai Namco announced that the massive expansion Shadow of the Erdtree has officially surpassed 10 million units sold globally. Hidetaka Miyazaki expressed deep gratitude to the Tarnished community for their overwhelming support and feedback regarding the challenging difficulty curve of the Realm of Shadow. Critics have hailed it as one of the greatest DLC expansions of all time.',
    category: 'Games',
    date: '2026-06-07',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    author: 'IGN Japan'
  },
  {
    id: 'n7',
    title: 'Jujutsu Kaisen Season 3: Culling Game Arc in Production',
    summary: 'MAPPA reveals key visuals and initial staff lists for the upcoming chaotic tournament arc.',
    content: 'Following the devastating Shibuya Incident, MAPPA has officially confirmed that Jujutsu Kaisen Season 3, adapting the Culling Game Arc, is in active production. The season will follow Yuji Itadori and Megumi Fushiguro as they participate in Kenjaku’s deadly death battle game. Staff members have promised unprecedented action sequence designs, maintaining the high-octane standard set by Season 2.',
    category: 'Anime',
    date: '2026-06-06',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&auto=format&fit=crop&q=80',
    author: 'Mappa PR'
  },
  {
    id: 'n8',
    title: 'Chiba Voice Actor Awards 2026 Winners Announced',
    summary: 'The prestigious voice actor awards celebrate outstanding performances in recent anime series.',
    content: 'The 2026 Voice Actor Awards took place last night in Tokyo, honoring the best talent in the industry. The Best Lead Actor award went to the voice of Sung Jinwoo for his chilling vocal evolution in Solo Leveling, while the Best Supporting Actress was awarded to the voice behind Frieren. The ceremony highlighted the increasing global appreciation for the dedication and artistry of seiyuus.',
    category: 'Anime',
    date: '2026-06-05',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80',
    author: 'Oricon News'
  },
  {
    id: 'n9',
    title: 'The Witcher: Sirens of the Deep Animated Film Delayed to 2026',
    summary: 'Netflix announces a slight delay for the upcoming anime movie featuring Doug Cockle as Geralt.',
    content: 'Netflix has announced that the animated Witcher movie "Sirens of the Deep" will now release in early 2026. The film features the return of legendary voice actor Doug Cockle voicing Geralt of Rivia. The production studio, Studio Mir (known for Legend of Korra), requested extra time to polish the intricate underwater combat sequences. Netflix released a short clip showing Geralt researching a mystery in a seaside town.',
    category: 'Movies',
    date: '2026-06-04',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    author: 'Netflix Geeked'
  },
  {
    id: 'n10',
    title: 'Hollow Knight: Silksong Rated in Multiple Countries, Hinting at Release',
    summary: 'Ratings in Korea and Australia spark hope as Team Cherry completes certification milestones.',
    content: 'Hollow Knight fans are buzzing after Silksong received official age ratings in South Korea and Australia. Historically, games receive classifications within 3 to 6 months of release, suggesting that Team Cherry is finally preparing to launch the highly anticipated sequel. In Silksong, players control Hornet, princess-protector of Hallownest, as she ascends through a brand-new kingdom of silk and song.',
    category: 'Games',
    date: '2026-06-03',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    author: 'SteamDB Watch'
  }
];

const initialState: NewsState = {
  items: mockNews,
  categoryFilter: 'All',
  selectedItemId: null
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setCategoryFilter: (state, action: PayloadAction<'All' | 'Anime' | 'Games' | 'Movies' | 'TV-Series'>) => {
      state.categoryFilter = action.payload;
    },
    selectNewsItem: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    }
  }
});

export const { setCategoryFilter, selectNewsItem } = newsSlice.actions;
export default newsSlice.reducer;
