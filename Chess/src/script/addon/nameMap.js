function load_map(obj,root,nameMap)
{
    for(var name of nameMap)
        obj[name] = root.getChildByName(name);
}

export default load_map;