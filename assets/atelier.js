(function(){
  'use strict';
  var I=window.I18N;if(!I)return;
  var copy={
    'a.skip':['跳至作品','Skip to works'], 'a.works':['精选作品','Selected Works'], 'a.aesthetic':['美学宇宙','Aesthetics'], 'a.archive':['创作档案','Archive'],
    'a.signature':['科幻作者 / 数字造梦者','SCI-FI WRITER / DIGITAL DREAMER'],
    'a.poem':['在宇宙的某个角落，<br>制造自己的光。','Somewhere in the universe,<br>I make my own light.'],
    'a.description':['把无法安放的想象，写成故事、音乐与可以走进去的世界。','Turning restless imagination into stories, music, and worlds you can step inside.'],
    'a.explore':['探索我的创作','Explore my worlds'], 'a.map':['沿着星轨漫游 ↓','Follow the orbits ↓'], 'a.bottom':['无限想象 / 独立发光','IMAGINATION / INNER LIGHT'],
    'a.selected':['从这里，进入我的世界。','A few doors into my universe.'], 'a.all':['全部创作 ↗','All works ↗'],
    'a.constant':['凌晨两点三十四分，他第一次认真怀疑自己是一串代码。','At 2:34 a.m., he begins to seriously suspect he is a string of code.'], 'a.play':['进入故事 ↗','Enter the story ↗'],
    'a.abyss':['深渊里的回声','Echoes from the abyss'], 'a.music':['原创音乐、星球与影像，收容那些浓度过高的情绪。','Original music, planets, and imagery. A home for feelings too intense to contain.'], 'a.listen':['走进音乐宇宙 ↗','Enter the music universe ↗'],
    'a.gallery':['让方程生长成星系','Equations into galaxies'], 'a.science':['轨道、混沌与量子干涉。触碰一个念头，观察整个世界的回应。','Orbits, chaos, and quantum interference. Touch an idea; watch a world respond.'], 'a.enterGallery':['进入交互画廊 ↗','Enter the interactive gallery ↗'],
    'a.two':['同一颗心脏，两种引力。','One heart. Two gravities.'], 'a.twointro':['一个向外绽放，一个向内坍缩。<br>我的创作，在明暗之间生长。','One blooms outward. One collapses inward.<br>My work grows between light and shadow.'],
    'a.crystal':['星晶美学','Nova Crystal'], 'a.crystaldesc':['光穿透水晶。珍珠连接数据。玫瑰在零重力中绽放。','Light passes through crystal. Pearls become data. Roses bloom in zero gravity.'], 'a.iam':['「我是美的。」','“I am beautiful.”'],
    'a.collapse':['坍缩协议','Collapse Protocol'], 'a.collapsedesc':['光从裂缝渗出。帝国在燃烧。而毁灭依然有自己的秩序。','Light seeps through fractures. Empires burn. Even destruction has its own order.'], 'a.yours':['「我是你的。」','“I am yours.”'],
    'a.constellation':['每一个作品，都是我留在宇宙里的一颗星。','Every work is a star I leave in the universe.'], 'a.footer':['故事仍在继续，宇宙仍在膨胀。','The story continues. The universe expands.'],
    'u.h1':['每一个作品，<br>都是一颗<br><em>独立发光的星。</em>','A constellation<br>of worlds<br><em>made of me.</em>'],
    'u.intro':['科幻、音乐、交互与 AI。沿着星轨，走进我持续生长的创作宇宙。','Fiction, music, interaction, and AI. Follow the orbits through an ever-growing creative universe.'],
    'u.map.hint':['每条轨道代表一个创作分类。轻点星球查看名称，再次点击定位下方作品卡片。','Each orbit is a creative category. Tap a planet to see its name; tap again to find its project card below.']
  };
  Object.keys(copy).forEach(function(k){I.dict[k]={zh:copy[k][0],en:copy[k][1]};});
  I.apply();
})();
