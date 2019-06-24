export default class TargetSwitch extends Laya.Script{

    /** @prop {name:pos1X,tips:"位置1X坐标",type:Int} */
    /** @prop {name:pos1Y,tips:"位置1Y坐标",type:Int} */
    /** @prop {name:pos2X,tips:"位置2X坐标",type:Int} */
    /** @prop {name:pos2Y,tips:"位置2Y坐标",type:Int} */
    /** @prop {name:speed,tips:"移动速度",type:Int} */

    constructor(){
        super();
        this.state = 1;
    }

    onEnable(){
        this.pos1 = new Laya.Point(this.pos1X,this.pos1Y);
        this.pos2 = new Laya.Point(this.pos2X,this.pos2Y);

        var dis1 = this.pos1.distance(this.owner.x,this.owner.y);
        var dis2 = this.pos2.distance(this.owner.x,this.owner.y);

        this.state = dis2 > dis1 ? 1 : 2;
    }

    onUpdate(){
        if(this.state == 1){
            this.paceToTarget(this.pos1);
        }else if(this.state == 2){
            this.paceToTarget(this.pos2);
        }
    }

    paceToTarget(point){
        var curposX = this.owner.x;
        var curposY = this.owner.y;

        if(point.distance(curposX,curposY) < 5)return;

        if(point.distance(curposX,curposY) < this.speed){
            this.owner.pos(point.x,point.y);
        }else{
            var offPoint = new Laya.Point(point.x - curposX,point.y - curposY);
            offPoint.normalize();
            this.owner.pos(curposX + offPoint.x * this.speed,curposY + offPoint.y * this.speed);
        }
    }

    switchTarget(){
        this.setState(3 - this.state);
    }

    setState(_state){
        this.state = _state;
    }
}