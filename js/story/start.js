//进入关卡

import DataBus   from '../databus'

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

export default class storyStart {
  constructor(ctx,fontSize) {

    this.fontSize = fontSize||20

    this.x = 0 - this.fontSize * 1.5
    this.visible = true

    this[__.speed] = 4
  }

  // 数字转换为中文
  SectionToChinese(section) {
    var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
    var chnUnitChar = ["", "十", "百", "千"];
    var strIns = '', chnStr = '';
    var unitPos = 0;
    var zero = true;
    while (section > 0) {
      var v = section % 10;
      if (v === 0) {
        if (!zero) {
          zero = true;
          chnStr = chnNumChar[v] + chnStr;
        }
      } else {
        zero = false;
        strIns = chnNumChar[v];
        strIns += chnUnitChar[unitPos];
        chnStr = strIns + chnStr;
      }
      unitPos++;
      section = Math.floor(section / 10);
    }
    return chnStr;
  }
  NumberToChinese(num) {
    var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
    var chnUnitChar = ["", "十", "百", "千"];
    var unitPos = 0;
    var strIns = '', chnStr = '';
    var needZero = false;

    if (num === 0) {
      return chnNumChar[0];
    }

    while (num > 0) {
      var section = num % 10000;
      if (needZero) {
        chnStr = chnNumChar[0] + chnStr;
      }
      strIns = this.SectionToChinese(section);
      strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
      chnStr = strIns + chnStr;
      needZero = (section < 1000) && (section > 0);
      num = Math.floor(num / 10000);
      unitPos++;
    }

    return chnStr;
  }

  render(ctx) {
    if (!this.visible)
      return

    ctx.fillStyle = "#ffffff"
    ctx.font = this.fontSize+"px Arial"

    ctx.textAlign = "center";//设置居中
    ctx.fillText(
      '第' + this.NumberToChinese(databus.passNum)+'关',
      this.x,
      screenHeight / 2 - 10
    )
    ctx.textAlign = "left";//画完设置回左对齐
  }

  update(callback){
    if (!this.visible)
      return

    if (this.x - this.fontSize * 1.5 >= screenWidth){
      this.visible = false//出了屏幕就不更新
      callback()//当出屏幕时，执行回调（开始游戏）
    }

    if (this.x >= screenWidth / 2) {
      if (!this.frame)
        this.frame = databus.frame//获取第一次居中时的帧数 
      if (this.frame + 60 <= databus.frame)//停留60帧后继续前进
        this.x += this[__.speed]
    }
    else
      this.x += this[__.speed]
  }
}
