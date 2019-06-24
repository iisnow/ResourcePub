import load_map from "../addon/nameMap"
    
export default class GridSet extends Laya.Script{

    constructor(){
        super();

        this.showing = false;
        this.GrdiData = {
            color:[255,255,255],
            title:"Hello",
            func:function(player){},
            moveTag:0,      
            scoreGet:0,
            desc:"",
            index:0,
            pos:[0,0]
        }
        this.colorDirty = false;
    }

    onEnable(){
        load_map(this,this.owner.content,["title","bg","desc"]);
        this.refreshGrid();
        this.showing = true;
    }

    onUpdate(){
        if(this.colorDirty && this.bg.filters){
            this.colorFilter = this.bg.filters[0];
            var color = this.GrdiData.color;
            this.colorFilter.color(color[0],color[1],color[2]);
        }
    }

    SetGridData(_data){
        this.GrdiData = _data;
        if(this.showing){
            this.refreshGrid();
        }
        this.colorDirty = true;
    }

    refreshGrid(){
        this.owner.pos(this.GrdiData.pos[0],this.GrdiData.pos[1]);
        this.title.text = this.GrdiData.title;
        this.desc.text = this.GrdiData.desc;
    }
}