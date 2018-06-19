//游戏入口主函数

import Player from './player/index'
import Skill from './player/skill'
import Enemy from './npc/enemy'
import Boss from './npc/boss'
import Props from './npc/props'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import StoryStart from './story/start.js'

let ctx = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.restart()
  }

  restart() {
    databus.reset()//重新开始，清除databus数据

    this.player = new Player(ctx)//画玩家
    this.gameinfo = new GameInfo()//画游戏分数
    this.skill = new Skill(3)//新建技能    

    this.state()
  }

  //下一关(玩家、积分、技能cd不重置)
  next(){
    databus.next()

    this.state()
  }

  //restart和next都执行的
  state(){
    var that = this
    
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )//移除游戏结束的触摸事件

    this.bg = new BackGround(ctx)//画背景
    this.music = new Music()//新建音乐
    this.storyStart = new StoryStart(ctx, 30)//新建关卡开始
    databus.boss = new Boss()//新建boss
    this.bindLoop = this.loop.bind(this)//帧数叠加
    this.hasEventBind = false//游戏结束的触摸事件是否设定

    canvas.addEventListener('touchstart', function (e) {

      let x = e.touches[0].clientX
      let y = e.touches[0].clientY

      let area = that.skill.btnSkill

      if (x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY)
        !that.skill.CD ? that.skill.useSkill() : console.log('CD中')//不在cd中执行
    })//设定技能按钮

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    //重新执行动画
    this.aniId = window.requestAnimationFrame(
      this.bindLoop,//下一帧执行函数
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0 && !databus.boss.visible) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)//设置敌机速度
      databus.enemys.push(enemy)//保存敌机
    }
  }
  // propsGenerate() {
  //   if (databus.frame % 50 === 0) {
  //     let props = databus.pool.getItemByClass('props', Props)
  //     props.init(1.5)//设置道具速度
  //     databus.props.push(props)//保存道具
  //   }
  // }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {//循环子弹
      for (let i = 0, il = databus.enemys.length; i < il; i++) {//循环敌机
        let enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {//判断子弹和敌机是否碰撞，敌机是否在爆炸动画中
          enemy.health -= bullet.harm//敌机血量减少

          bullet.visible = false//清除子弹
          databus.score += bullet.harm//积分+1

          if (enemy.health<=0){//血量小于0，摧毁敌机
            enemy.propsDrop()//掉落道具
            enemy.playAnimation()//初始化爆炸动画
            that.music.playExplosion()//初始化爆炸音乐
          }

        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {//循环敌机
      let enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {//判断玩家和敌机是否碰撞
        this.player.playAnimation()//初始化爆炸动画
        that.music.playExplosion()//初始化爆炸音乐
        databus.gameOver = true//游戏结束

      }
    }

    for (let i = 0, il = databus.props.length; i < il; i++) {//循环道具
      let props = databus.props[i]
      
      if (this.player.isCollideWith(props)) {//判断玩家和道具是否碰撞
        props.visible = false//隐藏道具
        if (this.player.level<4){//最高等级为4，高了就加分
          this.player.level++//等级增加
        }else{
          databus.score++//分数增加
        }

      }
    }

    if(databus.boss.visible){

      for (let i = 0, il = databus.bullets.length; i < il; i++) {//循环子弹
        let bullet = databus.bullets[i]

        if (databus.boss.isCollideWith(bullet)) {//判断子弹和boss是否碰撞
          databus.boss.health -= bullet.harm//敌机血量减少

          bullet.visible = false//清除子弹
          databus.score += bullet.harm//积分+1

          if (databus.boss.health <= 0) {//血量小于0，摧毁boss
            databus.boss.propsDrop()//掉落道具
            databus.boss.playAnimation()//初始化爆炸动画
            that.music.playExplosion()//初始化爆炸音乐
            databus.gameOver = true;databus.gameWin = true//胜利
          }

          break
        }
      }

      if (this.player.isCollideWith(databus.boss)) {//判断玩家和boss是否碰撞
        this.player.playAnimation()//初始化爆炸动画
        that.music.playExplosion()//初始化爆炸音乐
        databus.gameOver = true//游戏结束
      }
    }

    for (let i = 0, il = databus.bossBullets.length; i < il; i++) {//循环boss子弹
      let bossBullet = databus.bossBullets[i]

      if (bossBullet.isCollideWith(this.player)) {//判断玩家和敌机是否碰撞
        this.player.playAnimation()//初始化爆炸动画
        that.music.playExplosion()//初始化爆炸音乐
        databus.gameOver = true//游戏结束

      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (x >= area.startX
      && x <= area.endX
      && y >= area.startY
      && y <= area.endY)
      databus.gameWin ? this.next() : this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)//重绘背景
    this.storyStart.render(ctx)
    if (!databus.gameStart)
      return//未开始，只绘制背景和开始动画


    this.player.render(ctx)//重绘玩家战机    
    if (databus.playerIn)
      return//飞机进场动画
        
    if (databus.boss.visible)
      databus.boss.render(ctx)//重绘boss

    this.skill.render(ctx)//重绘技能

    databus.bullets
      .concat(databus.enemys)
      .concat(databus.props)
      .concat(databus.bossBullets)
      .forEach((item) => {
        item.drawToCanvas(ctx)//重绘敌机和子弹
      })

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {//判断如果在播放，即播放动画
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)//重绘分数

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)//绘制游戏结束表

      if (!this.hasEventBind) {//游戏结束并且没触摸时间执行
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)//重设游戏结束的触摸事件
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {

    if (databus.gameOver)
      return;//如果游戏结束不执行


    this.storyStart.update((() => {
      databus.gameStart = true//开始游戏
      databus.playerIn = true//飞机入场动画开始
    }).bind(this))
    if (!databus.gameStart)
      return;//开始动画判断


    this.bg.update()//更新背景动画（单个）
    if (databus.playerIn){
      this.player.playerIn()//飞机入场动画
      return
    }

    if (databus.boss.visible)
      databus.boss.update()//更新boss

    this.skill.update()//更新技能

    databus.bullets
      .concat(databus.enemys)
      .concat(databus.props)
      .concat(databus.bossBullets)
      .forEach((item) => {
        item.update()
      })//更新子弹、敌人动画（数组）

    this.enemyGenerate()//根据帧数生成敌人

    this.collisionDetection()//检测是否碰撞

    if (databus.frame % 20 === 0) {//20帧执行一次射击（子弹的频率）
      this.player.shoot()//射击动画
      this.music.playShoot()//射击音效
    }
    
    if (databus.boss.visible)
      if (databus.frame % 20 === 0) {
        databus.boss.shoot(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2)//射击动画
        this.music.playShoot()//射击音效
      }

    if (databus.score >= 10 && !databus.boss.visible)//积分大于10召唤boss
      databus.boss.visible = true
      // databus.gameOver = true;databus.gameWin = true
    
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,//下一帧执行函数
      canvas
    )
  }
}
