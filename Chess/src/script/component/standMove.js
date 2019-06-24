export default class StandMove extends Laya.Script {

    /** @prop {name:moveSpeed,tips:"移动速度",type:Int} */

    constructor() {
        super();
        this.calcPos = (_index,_id) => {
            return [0, 0];
        };
        this.triggerFunc = (index,pass) => {};
        this.stPos = 0;
        this.edPos = 0;
        this.targetPos = [0, 0];
        this.movePace = [0, 0];
        this.dir = 1;

        this.index = 0;

        this.current = false;
        this.br = 0;
    }

    onEnable() {
        Laya.timer.frameLoop(1, this, () => {
            if (this.movePace[0] != 0 || this.movePace[1] != 0)
                this.owner.pos(this.owner.x + this.movePace[0], this.owner.y + this.movePace[1])
        });

        Laya.timer.loop(100,this,()=>{
            if(this.current){
                if(this.owner.filters){
                    var filter = this.owner.filters[0];
                    var pbr = Math.sin(this.br) * 100;
                    this.br += 0.4;
                    var cbr = Math.sin(this.br) * 100;
                    filter.adjustBrightness(cbr - pbr);
                }
            }
        });
    }

    SetCalcPos(func) {
        this.calcPos = func;
        this.EnsurePlace();
    }

    SetStandIndex(id){
        this.index = id;
        this.owner.texture = `image/t${id}.png`;
    }

    MoveToPos(stindex, edindex, reFunc) {
        this.stPos = stindex;
        this.edPos = edindex;
        this.triggerFunc = reFunc;

        this.dir = edindex > stindex ? 1 : -1;

        this.EnsurePlace();

        this.PaceOn();
    }

    PaceOn() {
        var curPos = [this.owner.x, this.owner.y];
        if (this.edPos != this.stPos) {
            var targetPos = this.calcPos(this.stPos + this.dir,this.index);
            this.targetPos = targetPos;

            var xoff = this.targetPos[0] - curPos[0];
            var yoff = this.targetPos[1] - curPos[1];

            var distance = Math.sqrt(xoff * xoff + yoff * yoff);
            var timeCost = distance / this.moveSpeed;

            this.movePace = [this.moveSpeed * xoff / distance, this.moveSpeed * yoff / distance];

            Laya.timer.frameOnce(timeCost, this, () => {
                this.stPos += this.dir;
                this.EnsurePlace();
                this.triggerFunc(this.stPos,this.stPos==this.edPos);
                this.PaceOn();
            });
        } else {
            this.movePace = [0, 0];
            this.EnsurePlace();
        }
    }

    EnsurePlace(){
        var targetPos = this.calcPos(this.stPos,this.index);
        this.owner.pos(targetPos[0], targetPos[1])
    }

    GetCurrent(){
        this.current = true;
    }

    LoseCurrent(){
        this.current = false;
        if(this.owner.filters){
            var filter = this.owner.filters[0];
            filter.reset();
            this.br = 0;
        }
    }
}