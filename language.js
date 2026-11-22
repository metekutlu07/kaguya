// Localized narrative for the same five encounters, not a separate experience.
export let language='zh';
export const englishChapters=[
 {name:'The Swallow’s Cowrie',emotion:'Serenity',text:'A shell from a swallow’s nest carries a wish for peace. It holds Kaguya, and with her, my own quiet longing for a place to feel at home.'},
 {name:'The Fire-Rat Robe',emotion:'Protection',text:'The legendary robe that cannot be harmed by fire becomes a soft blanket. When I feel tired or anxious, I wrap myself in it and withdraw from the world for a while.'},
 {name:'The Jade Branch',emotion:'Devotion',text:'That unattainable jade branch is the person I would cross mountains and seas to see. This light stick holds all the devotion with which I pursue what I love.'},
 {name:'The Buddha’s Stone Bowl',emotion:'Joy',text:'The stone bowl that once held a monk’s nourishment becomes a game controller. Gaming is my own spiritual nourishment, a joy I need not share with anyone else.'},
 {name:'The Dragon-Head Jewel',emotion:'Desire',text:'The five-colored jewel from the depths of the sea becomes a desire chest mimic. Tags, receipts and top-up vouchers cling to its surface like barnacles. Desire accumulates, growing heavier and heavier.'}
];
const strings={
 zh:{title:'辉夜 · 五件宝物，五种执念',name:'郭佳欣',prologue:'序章',epilogue:'终章',openingTitle:'辉夜',subtitle:'五件宝物，五种执念',intro:'千年之后，我们依然追逐那些超越物品本身的承诺。五件神话中的宝物，化作五件当代日常物件，映照人心深处的五种渴望。',invitation:'向上滑动，一同走向月亮。',endingTitle:'月之彼岸',beyondHint:'继续滑动，前往月之彼岸！',endingFirst:'愿每一件虚妄之物，',endingSecond:'都能托起一份真实的心愿。',restart:'重访绘卷',startHint:'向上滑动 · 一同走向月亮',explore:'上下滑动 · 探索绘卷',moon:'继续滑动 · 走向月亮',returnHint:'向下滑动 · 回望来路'},
 en:{title:'Kaguya · Five Treasures, Five Desires',name:'Guo Jiaxin',prologue:'Prologue',epilogue:'Epilogue',openingTitle:'Kaguya',subtitle:'Five Treasures, Five Desires',intro:'A thousand years later, we still pursue objects that promise something beyond themselves. Five mythical treasures become five contemporary objects, each carrying a different human longing.',invitation:'Scroll to begin your journey to the moon.',endingTitle:'Beyond the Moon',beyondHint:'Keep scrolling to go beyond the moon!',endingFirst:'May every illusory treasure',endingSecond:'hold a genuine wish.',restart:'Revisit the journey',startHint:'Scroll to journey to the moon',explore:'Scroll to explore the tale',moon:'Keep scrolling towards the moon',returnHint:'Scroll back to retrace your journey'}
};
export function getCopy(){return strings[language]}
export function setLanguage(value){
 language=value==='en'?'en':'zh';const s=getCopy();
 document.documentElement.lang=language==='en'?'en':'zh-CN';document.title=s.title;
 for(const [selector,key] of [['.title','title'],['.opening h1','openingTitle'],['.opening h2','subtitle'],['.opening p','intro'],['.opening-credit','name'],['.opening-invitation','invitation'],['.ending h2','endingTitle'],['.ending-scroll','beyondHint'],['.ending-credit','name'],['.restart','restart'],['.signature','name'],['.note','startHint']])document.querySelector(selector).textContent=s[key];
 const verse=document.querySelector('.ending p');verse.replaceChildren(document.createTextNode(s.endingFirst));const line=document.createElement('span');line.textContent=s.endingSecond;verse.append(line);
 document.querySelector('.opening').setAttribute('aria-label',s.prologue);document.querySelector('.ending').setAttribute('aria-label',s.epilogue);
}
