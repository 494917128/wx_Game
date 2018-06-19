//管控游戏状态

import Pool from './base/pool'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.pool = new Pool()

    this.reset()
  }

  //重新开始
  reset() {
    this.frame      = 0//游戏持续帧数
    this.score      = 0//积分
    this.passNum    = 1

    this.state()
  }

  //进入下一关(积分和帧数)
  next(){
    this.passNum += 1

    this.state()
  }

  // reset和next都执行的
  state(){
    this.boss = null//boss
    this.bullets = []//子弹
    this.bossBullets = []//子弹
    this.enemys = []//敌机
    this.animations = []//动画参数
    this.gameStart = false//游戏是否开始
    this.gameOver = false//是否游戏结束
    this.gameWin = false//是否游戏胜利
    this.playerIn = false//飞机进场特效
    this.props = []//道具
  }

  // 进入对象池前排序、默认升序
  sort(arr, name, rule){
    var boolean = rule == "desc" ? -1 : 1

    var compare = function (obj1, obj2) {
      var val1 = obj1[name];
      var val2 = obj2[name];
      if (val1 < val2) {
        return -boolean;
      } else if (val1 > val2) {
        return boolean;
      } else {
        return 0;
      }
    }

    return arr.sort(compare)
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   */
  removeEnemey(enemy) {

    var enemys = this.sort(this.enemys, 'y', 'desc')//进行降序

    let temp = enemys.shift()

    temp.visible = false

    this.pool.recover('enemy', enemy)
  }
  removeBossBullets(bossBullet) {

    var bossBullets = this.sort(this.bossBullets, 'y', 'desc')//进行降序

    let temp = bossBullets.shift()

    temp.visible = false

    this.pool.recover('bossBullet', bossBullet)
  }
  removeProps(prop) {

    var props = this.sort(this.props, 'y', 'desc')//进行降序

    let temp = props.shift()

    temp.visible = false

    this.pool.recover('props', prop)
  }
  /** 
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   */
  removeBullets(bullet) {

    var bullets = this.sort(this.bullets, 'y')//进行升序

    let temp = bullets.shift()

    temp.visible = false

    this.pool.recover('bullet', bullet)
  }
}
