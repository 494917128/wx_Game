//玩家技能类

import Sprite   from '../base/sprite'
import Bullet   from './bullet'
import DataBus  from '../databus'
import Music    from '../runtime/music'


const screenWidth    = window.innerWidth
const screenHeight   = window.innerHeight

// 玩家相关常量设置
const SKILL_IMG_SRC = 'images/hero.png'
const SKILL_WIDTH   = 40
const SKILL_HEIGHT  = 40
const SKILL_X       = 15
const SKILL_Y       = screenHeight - 80


let databus = new DataBus()

export default class Skill extends Sprite {
  constructor(CDTime) {
    super(SKILL_IMG_SRC, SKILL_WIDTH, SKILL_HEIGHT, SKILL_X, SKILL_Y)

    this.CD = true//技能不在cd中
    this.CDTime = CDTime||3//一次cd多少时间
    this.music = new Music()//新建音乐


    /**
     * 重新开始按钮区域
     * 方便简易判断按钮点击
     */
    this.btnSkill = {
      startX: SKILL_X,
      startY: SKILL_Y,
      endX: SKILL_X + SKILL_WIDTH,
      endY: SKILL_Y + SKILL_HEIGHT
    }
  }

  // 技能冷却
  cooldown(ctx){
    ctx.beginPath();
    ctx.arc(SKILL_X + SKILL_WIDTH / 2, SKILL_Y + SKILL_WIDTH / 2, SKILL_WIDTH / 2 + 1, 0 * Math.PI, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    if(this.CD){
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fill();
    }
    ctx.stroke();

    if (this.CD) {
      var CDNowTime = new Date().getTime()
      this.CDStartTime = this.CDStartTime||CDNowTime//第一次加载，设置默认开始时间
      if (CDNowTime - this.CDStartTime < this.CDTime*1000){
        // 画扇形
        ctx.beginPath();
        ctx.moveTo(SKILL_X + SKILL_WIDTH / 2, SKILL_Y + SKILL_WIDTH / 2);
        ctx.arc(
          SKILL_X + SKILL_WIDTH / 2,
          SKILL_Y + SKILL_WIDTH / 2,
          SKILL_WIDTH / 2,
          (-0.5 + (CDNowTime - this.CDStartTime) / this.CDTime / 1000 * 2) * Math.PI,
          1.5 * Math.PI
        );
        // 移动到圆心
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,255,0.5)";//填充颜色,默认是黑色
        ctx.fill();//画实心圆

        ctx.fillStyle = "#ffffff"
        ctx.font = "20px Arial"
        ctx.textAlign = "center";//设置居中

        ctx.fillText(
          parseInt(this.CDTime - (CDNowTime - this.CDStartTime)/1000),
          SKILL_X + SKILL_WIDTH / 2,
          SKILL_Y + SKILL_WIDTH / 2 + 10
        )
        ctx.textAlign = "left";//恢复
        
      } else {
        this.CD = false//CD结束
      }

    }
  }

  //使用技能
  useSkill(){
    for (let i = 0, il = databus.enemys.length; i < il; i++) {//循环敌机
      let enemy = databus.enemys[i]
      if (enemy.health>0) {//血量大于0，扣血
        enemy.health -= 10//敌机血量减少

        databus.score += 10//积分+10

        if (enemy.health <= 0) {//血量小于0，摧毁敌机
          enemy.propsDrop()//掉落道具
          enemy.playAnimation()//初始化爆炸动画
          this.music.playExplosion()//初始化爆炸音乐
        }

      }
    }
    
    databus.bossBullets.map((bossBullets)=>{
      bossBullets.visible = false//清除boss子弹
    })

    var boss = databus.boss
    if (boss.health > 0 && boss.visible){
      boss.health -= 10//敌机血量减少

      databus.score += 10//积分+10

      if (boss.health <= 0) {//血量小于0，摧毁敌机
        boss.propsDrop()//掉落道具
        boss.playAnimation()//初始化爆炸动画
        this.music.playExplosion()//初始化爆炸音乐
      }
    }
    this.CD = true
  }

  update(){
    if(!this.CD)//不在cd中，更新开始cd的时间
      this.CDStartTime = new Date().getTime()
  }

  render(ctx){
    this.drawToCanvas(ctx)
    this.cooldown(ctx)
  }
}
