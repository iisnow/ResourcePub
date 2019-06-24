export default class RandomTouzi extends Laya.Script{

    /** @prop {name:rollGap,tips:"骰子旋转周期",type:Int} */
    /** @prop {name:rollTime,tips:"骰子旋转时间",type:Int} */

    constructor(){
        super();
    }

    onEnable(){
        this.rolling = false;
        this.number = 1;

        this.owner.texture = `image/${this.number}.png`;
        
        Laya.timer.frameLoop(this.rollGap,this,()=>{
            if(this.rolling){
                this.RandomOnce();
            }
        });
    }

    Action(caller,resFunc){
        this.rolling = true;
        Laya.timer.once(this.rollTime,this,()=>{
            this.rolling =false;
            resFunc.call(caller,this.number);
        })
    }

    RandomOnce(){
        this.number = this.number + Math.floor(Math.random() * 5);
        this.number %= 6;
        this.number += 1;

        this.owner.texture = `image/${this.number}.png`;
    }
}