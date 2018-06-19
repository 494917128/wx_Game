//敌机boss类

import Animation from '../base/animation'
import DataBus   from '../databus'
import Props     from './props'
import BossBullet     from './bossBullet'

const ENEMY_IMG_SRC = 'images/enemy.png'
const ENEMY_WIDTH   = 250
const ENEMY_HEIGHT  = 150

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const __ = {
  speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end){
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Boss extends Animation {
  constructor() {
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

    this.health = 100//飞机血量

    this.x = rnd(0, screenWidth - ENEMY_WIDTH)
    this.y = -this.height

    this[__.speed] = 4

    this.visible = false//boss默认是不出现的
  }
  
  // 飞机爆炸后掉落道具
  propsDrop() {
    
      let props = databus.pool.getItemByClass('props', Props)
      props.init(this.x+this.width/2,this.y+this.height/2,1)//初始化道具
      databus.props.push(props)//保存道具
    
  }

  // boss的子弹
  shoot(playerX,playerY) {
    var bossBullet = databus.pool.getItemByClass('bossBullets', BossBullet)

    bossBullet.init(
      this.x + this.width / 2,
      this.y + this.height / 2 + 10,
      playerX, 
      playerY,//飞机的xy轴
      4//子弹的速度Y
    )

    databus.bossBullets.push(bossBullet)
  }

  moveX(){
    this.x += this[__.speed] / 2
  }
  // 每一帧更新敌机位置
  update() {
    if(!this.visible)
     return
    if (this.y <= screenHeight){
      if(this.y <= 10)
        this.y += this[__.speed]//先垂直移动进入
      else 
        this.moveX()//后水平移动

      if (this.x + this.width >= screenWidth)
        this.moveX = () => this.x -= this[__.speed] / 4
      else if (this.x <= 0)
        this.moveX = () => this.x += this[__.speed] / 4
    }
  }

  render(ctx){
    if (!this.visible)
      return
    this.drawToCanvas(ctx)
    if (this.health>=0){//有血的时候绘制血条
      ctx.fillStyle = 'red'
      ctx.fillRect(70, 20, (screenWidth - 140) * (this.health / 100), 10)
      ctx.strokeStyle = '#ffffff'
      ctx.strokeRect(70, 20, screenWidth - 140, 10)
    }
  }
}
