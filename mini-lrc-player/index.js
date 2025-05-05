// 歌词对象数组
let lyricList = [];

// 获取需要的dom
const doms = {
  audio: document.querySelector('audio'),
  ul: document.querySelector('.lyric-list'),
  container: document.querySelector('.container'),
}

// 获取必要元素的高度
let liHeight;
const ContainerHeight = doms.container.clientHeight;


/**
 * @description: 获取歌词数据
 * @param {string} filePath
 * @return {string}
 */
const getLyricContent = async (filePath) => {
  try {
    const res = await fetch(filePath);

    if (!res.ok) {
      throw new Error(`Http error! Status: ${res.status}, Status Text: ${res.statusText}`);
    }

    const data = await res.text();
    return data;
  } catch (error) {
    console.error('Fetching lyric content error:', error);
    return '';
  }
}


/**
 * @description: 将原始时间字符串转换为浮点数
 * @param {string} rawTime
 * @return {number}
 */
const parseTime = (rawTime) => {
  const [first, second] = rawTime.split(':');
  return (+first.slice(1) * 60 + (+second));
}


/**
 * @description: 返回解析的歌词对象数组
 * @param {string} lyricContent
 * @return {Array<{time: number, content: string}>}
 */
const parseLyricContent = (lyricContent) => {
  const lyricContentList = lyricContent.split('\n');
  const result = [];
  for (lyric of lyricContentList) {
    if (lyric) {      
      const [rawTime, content] = lyric.split(']'); // 通过lrc时间右侧的]切分歌词
      result.push({
        time: parseTime(rawTime),
        content: content.trim()
      })
    }
  }
  return result;
}


/**
 * @description: 获取当前播放进度下歌词所在位置的索引
 * @return {number}
 */
const getCurrentIndex = () => {
  const time = doms.audio.currentTime;
  for (let i = 0; i < lyricList.length; i++) {
    if (time < lyricList[i].time) {
      return i - 1;
    }
  }
  return lyricList.length - 1;
}


/**
 * @description: 设置歌词列表向上偏移的程度
 */
const setOffset = () => {
  const currentIndex = getCurrentIndex();
  let offset = currentIndex * liHeight - ContainerHeight / 2 + liHeight / 2;
  if (offset < 0) {
    offset = 0;
  }
  doms.ul.style.transform = `translateY(-${offset}px)`;
  // 去除先前歌词高亮样式
  let li = doms.ul.querySelector('.active');
  if (li) {
    li.classList.remove('active');
  }
  // 设置歌词高亮样式
  li = doms.ul.children[currentIndex];
  if (li) {
    li.classList.add('active');
  }
}


/**
 * @description: 初始化，将歌词装载到歌词列表中
 */
const initLyric = async () => {
  const lyricContent = await getLyricContent('./assets/song.lrc');
  lyricList = parseLyricContent(lyricContent);
  const frag = document.createDocumentFragment(); // 创建文档片段，先把li添加到其中，避免频繁修改dom
  for (let i = 0; i < lyricList.length; i++) {
    const li = document.createElement('li');
    li.textContent = lyricList[i].content;
    frag.appendChild(li);
  }
  doms.ul.appendChild(frag);
  liHeight = doms.ul.querySelector('.lyric-list li').clientHeight;
}


initLyric();
doms.audio.addEventListener('timeupdate', setOffset);