//boss子弹类

import Sprite   from '../base/sprite'
import DataBus  from '../databus'

const screenWidth = window.innerWidth//屏幕宽度
const screenHeight = window.innerHeight//屏幕高度

const BULLET_IMG_SRC = 'images/bullet.png'
const BULLET_WIDTH   = 16
const BULLET_HEIGHT  = 30

const __ = {
  speedX: Symbol('speedX'),
  speedY: Symbol('speedY')
}

let databus = new DataBus()

export default class Bullet extends Sprite {
  constructor() {
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT)
  }

  init(x, y, playerX, playerY, speedY) {
    this.x = x
    this.y = y
    
    var speedX = (playerX - x) * speedY / (playerY - y)
    this[__.speedX] = speedX
    this[__.speedY] = speedY

    this.harm = 1//子弹伤害

    this.visible = true
  }

  // 每一帧更新子弹位置
  update() {
    this.y += this[__.speedY]
    this.x += this[__.speedX]

    // 超出屏幕外回收自身
    if (this.y > screenHeight )
      databus.removeBossBullets(this)
  }
}
