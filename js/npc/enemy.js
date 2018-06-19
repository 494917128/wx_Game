//敌机类

import Animation from '../base/animation'
import DataBus   from '../databus'
import Props     from './props'

const ENEMY_IMG_SRC = 'images/enemy.png'
const ENEMY_WIDTH   = 60
const ENEMY_HEIGHT  = 60

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Enemy extends Animation {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

    this.health = 1//飞机血量

  }

  init(speed) {
    this.x = rnd(0, window.innerWidth - ENEMY_WIDTH)
    this.y = -this.height

    this[__.speed] = speed

    this.visible = true
  }
  
  // 飞机爆炸后掉落道具
  propsDrop() {
    
      let props = databus.pool.getItemByClass('props', Props)
      props.init(this.x+this.width/2,this.y+this.height/2,1)//初始化道具
      databus.props.push(props)//保存道具
    
  }

  // 每一帧更新敌机位置
  update() {
    this.y += this[__.speed]

    // 对象回收
    if ( this.y > window.innerHeight + this.height )
      databus.removeEnemey(this)
  }
}
