//敌机类

import Animation from '../base/animation'
import DataBus   from '../databus'

const PROPS_IMG_SRC = 'images/hero.png'
const PROPS_WIDTH   = 30
const PROPS_HEIGHT  = 30

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Props extends Animation {
  constructor() {
    super(PROPS_IMG_SRC, PROPS_WIDTH, PROPS_HEIGHT)

  }

  init(x,y,speed) {
    this.x = x - this.height / 2
    this.y = y - this.height / 2

    this[__.speed] = speed

    this.visible = true
  }

  moveX(){
    this.x += this[__.speed]
  }
  moveY(){
    this.y += this[__.speed] + 2
  }
  // 每一帧更新道具位置
  update() {
    // 在页面中循环
    if (this.x + this.width >= window.innerWidth) {
      this.moveX = () => this.x -= this[__.speed]
    } else if (this.x <= 0) {
      this.moveX = () => this.x += this[__.speed]
    } else if (this.y + this.height >= window.innerHeight) {
      this.moveY = () => this.y -= this[__.speed]
    } else if (this.y <= 0) {
      this.moveY = () => this.y += this[__.speed] + 2
    }

    this.moveX();this.moveY()

    // 对象回收
    if ( this.y > window.innerHeight + this.height )
      databus.removeProps(this)
  }
}
