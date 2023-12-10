class Point2D
{

    /** @type {Number} X coordinate */
    x;
    /** @type {Number} Y coordinate */
    y;

    /**
     * @param  {Number} x X coordinate
     * @param  {Number} y Y coordinate
     */
    constructor (x, y)
    {
        this.x = x;
        this.y = y;
    }
    
    toString()
    {
        console.log('toString');
        return `{x: ${this.x}, y: ${this.y}}`;
    }

    /**
     * 
     * @param {Point2D} point 
     * @returns {Boolean}
     */
    equal(point)
    {
        return this.x == point.x && this.y == point.y;
    }

    /**
     * 
     * @param {Point2D} point 
     * @returns {Number}
     */
    dist(point)
    {
        return Math.sqrt(Math.pow(Math.abs(this.x - point.x), 2) + Math.pow(Math.abs(this.y - point.y), 2));
    }

    clone()
    {
        return new Point2D(this.x, this.y);
    }
}

class GridNode
{
    /** @type {Point2D} point */
    point;
    /** @type {Number} cost weight */
    cost = Infinity;
    /** @type {Point2D} parent node */
    parent;

    /** @type {Number} X coordinate */
    get x()
    {
        return this.point.x;
    };

    /** @type {Number} Y coordinate */
    get y()
    {
        return this.point.y;
    };

    /**
     * @param  {Point2D} point point
     */
    constructor (point)
    {
        this.point = point;
    }

    /**
     * 
     * @param {GridNode | Point2D} point 
     * @returns {Boolean}
     */
    equal(item)
    {
        return this.x == item.x && this.y == item.y;
    }

    /**
     * 
     * @param {GridNode | Point2D} point 
     * @returns {Number}
     */
    dist(point)
    {
        return Math.sqrt(Math.pow(Math.abs(this.x - point.x), 2) + Math.pow(Math.abs(this.y - point.y), 2));
    }

}

/**
 * @extends {Array<GridNode>}
 */
class NodesMap extends Array
{
    /**
     * 
     * @param  {...GridNode} items 
     */
    constructor (...items)
    {
        super(...items);
    }

    /**
     * 
     * @param {GridNode} item 
     */
    add(item)
    {
        for (let i = 0; i < this.length; i++) {
            if(item.cost > this[i].cost)
            {
                this.splice(i, 0, item);
                return this;
            }
        }

        this.push(item);

        return this;
    }

    /**
     * 
     * @param {GridNode} item 
     */
    remove(item)
    {
        const index = this.getIndex(item);

        if(index == -1)
        {
            return null;
        }

        return this.splice(index, 1);
    }

    /**
     * 
     * @param {GridNode | Point2D} item 
     */
    getIndex(item)
    {
        return this.findIndex(function(element)
        {
            return item.equal(element);
        });
    }
}




class CoordHelper
{
    /**
     * @param  {Point2D} point Cartesian coordinates
     * @returns {Point2D} Isometric coordinates
     */
    static cartToIso(point)
    {
		//gx=(isox-isoxy)
		//gy=(isoy+isox)/2 
		const result = new Point2D(0, 0);
		result.x = point.x - point.y;
		result.y = (point.x + point.y) / 2;
		return result;
    }

    /**
     * @param  {Point2D} point Isometric coordinates
     * @returns {Point2D} Cartesian coordinates
     */
    static isoToCart(point)
    {
		//gx=(2*isoy+isox)/2; 
		//gy=(2*isoy-isox)/2 
		const result = new Point2D(0, 0);
		result.x = (2 * point.y + point.x) / 2;
		result.y = (2 * point.y - point.x) / 2;
		return result;
    }

    /**
     * Convert 2d point to tile row/column
     * @param {*} point 
     * @param {*} tileHeight 
     * @returns {Point2D}
     */
    static getTileCoordinates(point, tileHeight)
    {
		const result = new Point2D(0, 0);
        result.x = Math.floor(point.x / tileHeight);
        result.y = Math.floor(point.y / tileHeight);
        return result;
    }

    /**
     * !!!!!!!!!!! FIX IT Convert tile row/column to 2d point
     * @param {*} point 
     * @param {*} tileHeight 
     * @returns {Point2D}
     */
    static get2DFromTileCoordinates(point, tileHeight)
    {
		const result = new Point2D(0, 0);
        result.x = point.x * tileHeight;
        result.y = point.y * tileHeight;
        return result;
    }

    /**
     * 
     * @param {Point2D} pointStart 
     * @param {Point2D} pointEnd 
     * @param {Number} maxSteps 
     * @param {Array<Array<Number>>} walkableMap 
     * @returns 
     */
    static getPath(pointStart, pointEnd, maxSteps, walkableMap)
    {
        const path = [];
        let curPoint = pointStart.clone();
        let x = 0;
        let y = 0;

        let counter = 0; // Не люблю вайлы...
        const _maxSteps = maxSteps ? maxSteps : 50;

        path.push(curPoint.clone());
        
        if(curPoint.equal(pointEnd))
        {
            return path;
        }

        do
        {
            x = pointEnd.x - curPoint.x;
            y = pointEnd.y - curPoint.y;
            
            if(x != 0 && Math.abs(x) >= Math.abs(x))
            {
                curPoint.x += x > 0 ? 1 : -1;
            }
            else
            {
                curPoint.y += y > 0 ? 1 : -1;
            }

            path.push(curPoint.clone());
            counter++;
        }
        while( counter <= _maxSteps  && (curPoint.x != pointEnd.x || curPoint.y != pointEnd.y) );

        return path;
    }

    /**
     * 
     * @param {Point2D} pointStart 
     * @param {Number} maxSteps 
     * @param {Array<Array<Number>>} walkableMap
     * @returns {NodesMap} array of walkable grid nodes
     */
    static getMovablePaths(pointStart, maxSteps, walkableMap)
    {
        const reachable = new NodesMap();
        const explored = new NodesMap();

        let counter = 0; // While....

        /** @type {GridNode} */
        let cur_node = new GridNode(pointStart);
        cur_node.cost = 0;

        /** @type {NodesMap} */
        let neighbors;
        
        reachable.add(cur_node);
        
        while(reachable.length != 0 && counter < 1000)
        {
            cur_node = reachable[0];
            
            reachable.remove(cur_node);

            if(cur_node.cost > maxSteps)
            {
                counter++;
                continue;
            }

            explored.add(cur_node);

            neighbors = this.#getNeighboringNodes(cur_node, explored, walkableMap);

            for (let i = 0; i < neighbors.length; i++) {

                if(reachable.getIndex(neighbors[i]) == -1)
                {
                    reachable.add(neighbors[i]);
                }
                
                if(cur_node.cost + 1 < neighbors[i].cost)
                {
                    neighbors[i].parent = cur_node;
                    neighbors[i].cost = cur_node.cost + 1;
                }
            }

            counter++
        }

        return explored;
    }
    
    /**
     * 
     * @param {Point2D} pointStart 
     * @param {Point2D} pointEnd 
     * @param {Array<Array<Number>>} walkableMap
     * @returns {Array<Point2D>}
     */
    static findPath(pointStart, pointEnd, walkableMap)
    {
        const reachable = new NodesMap();
        const explored = new NodesMap();

        let counter = 0; // While....

        /** @type {GridNode} */
        let cur_node = new GridNode(pointStart);
        cur_node.cost = 0;

        /** @type {NodesMap} */
        let neighbors;
        
        reachable.add(cur_node);
        
        while(reachable.length != 0 && counter < 1000)
        {
            cur_node = this.#getNextPathNode(reachable, pointEnd);
            
            if(cur_node.equal(pointEnd))
            {
                return this.#buildPath(cur_node);
            }

            reachable.remove(cur_node);
            explored.add(cur_node);

            neighbors = this.#getNeighboringNodes(cur_node, explored, walkableMap);

            for (let i = 0; i < neighbors.length; i++) {

                if(reachable.getIndex(neighbors[i]) == -1)
                {
                    reachable.add(neighbors[i]);
                }
                
                if(cur_node.cost + 1 < neighbors[i].cost)
                {
                    neighbors[i].parent = cur_node;
                    neighbors[i].cost = cur_node.cost + 1;
                }
            }

            counter++
        }

        return new Array();
    }

    /**
     * 
     * @param {GridNode} node 
     * @param {NodesMap} explored 
     * @param {Array<Array<Number>>} walkableMap
     * @returns {NodesMap}
     */
    static #getNeighboringNodes(node, explored, walkableMap)
    {
        const neighbors = new NodesMap();
        const height = walkableMap.length
        const width = walkableMap.length > 0 ? walkableMap[0].length : 0;

        const points = new Array(
            new Point2D(-1,  0), // left
            new Point2D( 0, -1), // top
            new Point2D( 1,  0), // right
            new Point2D( 0,  1), // bottom
        );
        
        let curPoint;
        for (let i = 0; i < points.length; i++) {

            curPoint = new Point2D(node.x + points[i].x, node.y + points[i].y);

            if(explored.getIndex(curPoint) != -1)
            {
                continue;
            }

            if(curPoint.x < 0 || curPoint.x >= width || curPoint.y < 0 || curPoint.y >= height)
            {
                continue;
            }

            if(walkableMap[curPoint.y][curPoint.x] == 0)
            {
                continue;
            }

            neighbors.add(new GridNode(curPoint));
        }

        return neighbors;
    }

    /**
     * 
     * @param {Array<GridNode>} nodes
     * @param {GridNode | Point2D} end_node
     * @returns {GridNode}
     */
    static #getNextPathNode(nodes, end_node)
    {
        let min_cost = Infinity;
        let min_node;
        let cost;
    
        for (let i = 0; i < nodes.length; i++)
        {
            cost = nodes[i].cost + nodes[i].dist(end_node);
    
            if (min_cost > cost)
            {
                min_cost = cost;
                min_node = nodes[i];
            }
        }
    
        return min_node;
    }

    /**
     * 
     * @param {GridNode} endNode end node
     * @returns {Array<Point2D>}
     */
    static #buildPath(endNode)
    {
        const path = new Array();
        let node = endNode;

        while (node != undefined)
        {
            path.push(node.point);
            node = node.parent;
        }

        return path;
    }
}

class Character extends EventTarget
{
    static instancesCount = 0;
    #instanceNumber = 0;
    _name = 'character';

    /** @type {String} base folder for images*/
    #folder;
   
    /** @type {HTMLElement} main HTMLElement*/
    #html_element;
    /** @type {HTMLElement} character image HTMLElement*/
    #img_element;

    /** @type {Point2D}  X, Y position */
    coord;
    /** @type {Point2D}  N, M index in grid */
    point;
    /** @type {Point2D}  X, Y move position start */
    coordStart;
    /** @type {Point2D}  X, Y move position end*/
    coordEnd;
    /** @type {Number}  Jump height in pixels */
    jumpHeight = 30;
    /** @type {Point2D}  N, M index in grid */
    pointEnd;
    /** @type {Point2D}  size of cell */
    size;
    /** @type {Number} index of image */
    img_index;
    /** @type {boolean} is move */
    isMove;
    /** @type {Number} move animation duration in seconds */
    animation_move_duration = 0.5;
    /** @type {Number} idle animation duration in seconds */
    animation_idle_duration = 2;
    /** @type {Number} timer move animation in milliseconds */
    #animate_move_timer = 0;
    /** @type {Number} timer move animation in milliseconds */
    #animate_idle_timer = 0;
    /** @type {Number} max move steps */
    max_move_steps = 3;
    /** @type {Array<Cell>} array of highlighted cells */
    highlightedCells;

    /** @type {CustomEvent} event onPointChanged */
    #event_point_changed;


    /**
     * 
     * @param  {Point2D} coord X, Y position
     * @param  {Point2D} size size of cell
     * @param  {Number} img_index index of image
     * @param  {HTMLElement} parent parent container
     */
    constructor (coord, size, img_index, folder, parent)
    {
        super();

        this.#instanceNumber = Character.instancesCount++;
        this.highlightedCells = new Array();

        this.coord = coord;
        this.size = size;
        this.img_index = img_index;
        this.#folder = folder;

        this.#html_element = document.createElement('div');
        this.#html_element.className = 'user';
        this.#html_element.id = `user`;

        this.setPosition(coord);
        this.setMorphMove(0)

        this.#img_element = document.createElement('img');
        this.#img_element.className = `user_image`;
        this.#img_element.src = `${ this.#folder + this.#addZeros(this.img_index, 3) }.png`;

        this.#html_element.appendChild(this.#img_element);
        parent.appendChild(this.#html_element);

        this.#init_events();

        this.doIdleAnimate();
    }

    get name()
    {
        return this._name + this.#instanceNumber;
    }

    get currentPoint()
    {
        return this.point;
    }

    #init_events()
    {
        const _this = this;

        this.#event_point_changed =  new CustomEvent("onPointChanged", { 
            detail: { value: function () {
                return _this.point;
            }}
        });
    }

    #addZeros(num, min_width)
    {
        let zeros = '';
        const str = new String(num);

        for (let i = str.length; i < min_width; i++)
        {
            zeros += '0';
        }

        return zeros + str;
    }

    /**
     * 
     * @param  {Point2D} point X, Y position
     */
    setPosition(point)
    {
        this.#html_element.style.left = point.x + 'px';
        this.#html_element.style.top = (point.y - this.size.y / 2.5) + 'px';
        this.coord = point;
    }

    /**
     * 
     * @param  {Point2D} point X, Y position
     */
    setPoint(point)
    {
        this.point = point;
        this.dispatchEvent(this.#event_point_changed);
        this.#html_element.style.zIndex = point.y;
    }

    /**
     * 
     * @param {Number} steep Morph steep 0..1000
     */
    setMorphMove(steep)
    {
        const amplitude = Math.sin(Math.PI / 1000 * steep);

        this.#html_element.style.width = (this.size.x - (this.size.x / 6 * amplitude)) + 'px';
        this.#html_element.style.height = (this.size.y + (this.size.y / 10 * amplitude)) + 'px';
    }

    /**
     * 
     * @param {Number} steep Morph steep 0..1000
     */
    setMorphIdle(steep)
    {
        const amplitude = Math.sin(Math.PI / 1000 * steep);

        //this.#html_element.style.width = (this.size.x - (this.size.x / 10 * amplitude)) + 'px';
        this.#html_element.style.transform = `scale(${1 + amplitude / 10}, ${1 - amplitude / 10}) translate(0px, ${amplitude * 1.5}px)`;
        //this.#html_element.style.height = (this.size.y + (this.size.y / 10 * amplitude)) + 'px';
    }

    /**
     * 
     * @param  {Point2D} coord X, Y position
     * @param  {Point2D} point N, M position
     */
    move(coord, point)
    {
        this.coordStart = this.coord;
        this.coordEnd = coord;
        this.pointEnd = point;

        this.isMove = true;
        this.#animate_move_timer = Date.now();

        this.doMoveAnimate();
    }

    doMoveAnimate()
    {
        const dt = (Date.now() - this.#animate_move_timer) / this.animation_move_duration;

        const newPos = this.#getAnimatePos(this.coordStart, this.coordEnd, 0, -this.jumpHeight, dt / 1000)

        if(dt >= 1000)
        {
            this.setPosition(this.coordEnd);
            this.setMorphMove(0);
            this.isMove = false;
            this.setPoint(this.pointEnd);
            this.doIdleAnimate();

            return;
        }

        this.setPosition(newPos);
        this.setMorphMove(dt);

        const _this = this;

        window.requestAnimationFrame(function() {
            _this.doMoveAnimate();
        });
    }

    doIdleAnimate()
    {
        if(this.#animate_idle_timer == 0)
        {
            this.#animate_idle_timer = Date.now();
        }

        const dt = ( (Date.now() - this.#animate_idle_timer) / this.animation_idle_duration) % 1000;

        if(this.isMove)
        {
            this.#animate_idle_timer = 0;
            return;
        }

        this.setMorphIdle(dt);

        const _this = this;

        window.requestAnimationFrame(function() {
            _this.doIdleAnimate();
        });
    }


    #getAnimatePos(pointStart, pointEnd, xdepth, ydepth, t) {
        const pointDepth = new Point2D(
            xdepth + (pointStart.x + pointEnd.x) * 0.5,
            ydepth + (pointStart.y + pointEnd.y) * 0.5
        );

        return new Point2D(
            (1 - t) * (1 - t) * pointStart.x + 2*t * (1 - t) * pointDepth.x + t*t * pointEnd.x,
            (1 - t) * (1 - t) * pointStart.y + 2*t * (1 - t) * pointDepth.y + t*t * pointEnd.y
        );
    }

    /**
     * !!!!!!!!!!! FIX IT 
     * @param {Point2D} point N, M position
     * @param {Array<Array<Number>>} walkableMap walkable map
     */
    cellAvailableToMove(point, walkableMap)
    {
        if(point.equal(this.point))
        {
            return false;
        }

        const path = CoordHelper.findPath(this.point, point, walkableMap);

        if(path.length == 0 || path.length > this.max_move_steps)
        {
            return false;
        }

        if(path[0].x != point.x || path[0].y != point.y)
        {
            return false;
        }

        return true;
    }

}

class User extends Character
{
    available_move_class = 'available_move_user';
    max_move_steps = 4;
    _name = 'user';

    /**
     * 
     * @param  {Point2D} point N, M position on grid
     * @param  {Point2D} size size of cell
     * @param  {Number} img_index index of image
     * @param  {HTMLElement} parent parent container
     */
    constructor (point, size, img_index, parent)
    {
        const folder = './img/characters/player/player_';

        super(point, size, img_index, folder, parent);
    }
}

class Monster extends Character
{
    available_move_class = 'available_move_monster';
    max_move_steps = 3;
    _name = 'monster';

    /**
     * 
     * @param  {Point2D} point N, M position on grid
     * @param  {Point2D} size size of cell
     * @param  {Number} img_index index of image
     * @param  {HTMLElement} parent parent container
     */
    constructor (point, size, img_index, parent)
    {
        const folder = './img/characters/monster/monster_';

        super(point, size, img_index, folder, parent);

    }
}

class Cell
{
    #select_class = 'cell_select';
    #noselect_class = 'cell_noselect';

    /** @type {Point2D}  N, M index in grid */
    point;
    /** @type {Point2D}  X, Y coordinate point */
    coord;
    /** @type {Point2D}  size of cell */
    size;
    /** @type {Number} index of image */
    img_index;


    /** @type {HTMLElement} main HTMLElement*/
    #html_element;
    /** @type {HTMLElement} selected image HTMLElement*/
    #select_element
    /** @type {HTMLElement} tile image HTMLElement*/
    #img_element;

    /** @type {Map<String, Array<Array<String>>>} */
    highlight_map;

    /**
     * 
     * @param  {Point2D} point N, M tile index
     * @param  {Point2D} size size of cell
     * @param  {Number} img_index index of image
     * @param  {HTMLElement} parent parent element
     */
    constructor (point, size, img_index, parent, offset)
    {
        this.highlight_map = new Map();
        this.point = point;
        this.size = size;
        this.img_index = img_index;

        this.#html_element = document.createElement('div');
        this.#html_element.className = 'grid_cell';
        this.#html_element.id = `cell_${point.x}_${point.y}`;

        this.#select_element = document.createElement('div');
        this.#select_element.id = `cell_select_element`;

        this.coord = new Point2D(
            point.x * size.x / 2,
            point.y * size.y / 2
        )

        this.coord = CoordHelper.cartToIso(this.coord); //// ISO
        this.coord.x = this.coord.x// - size.x / 2;// + offset.x
        this.coord.y = this.coord.y// - size.y / 2;// + offset.y

        this.#html_element.style.left = this.coord.x + 'px';
        this.#html_element.style.top = this.coord.y + 'px';

        this.#img_element = document.createElement('img');
        this.#img_element.className = 'grid_cell_img';
        this.#img_element.src = `./img/tiles/tile_${ this.#addZeros(this.img_index, 3) }.png`;

        this.#html_element.appendChild(this.#select_element);
        this.#html_element.appendChild(this.#img_element);
        parent.appendChild(this.#html_element);
    }

    getElement()
    {
        return this.#html_element;
    }

    #addZeros(num, min_width)
    {
        let zeros = '';
        const str = new String(num);

        for (let i = str.length; i < min_width; i++)
        {
            zeros += '0';
        }

        return zeros + str;
    }

    /**
     * 
     * @param {boolean} is_available
     */
    select(is_available)
    {
        const selectedElements = document.getElementsByClassName(this.#select_class);
        const noselectedElements = document.getElementsByClassName(this.#noselect_class);

        for (let i = 0; i < selectedElements.length; i++)
        {
            selectedElements[i].classList.remove(this.#select_class);
        }

        for (let i = 0; i < noselectedElements.length; i++)
        {
            noselectedElements[i].classList.remove(this.#noselect_class);
        }

        if(is_available)
        {
            this.#select_element.classList.add(this.#select_class);
        }
        else
        {
            this.#select_element.classList.add(this.#noselect_class);
        }
    }

    /**
     * 
     * @param {String} targetName target name
     * @param {Array<String>} required required classes
     * @param {Array<String>} optional optional classes
     */
    highlight(targetName, required, optional)
    {
        this.highlight_map.set(targetName, [required, optional]);

        if(required)
        {
            this.#select_element.classList.add(...required);
        }

        if(optional)
        {
            this.#select_element.classList.add(...optional);
        }
    }

    /**
     * 
     * @param {String} targetName target name
     * @param {Array<String>} required required classes
     * @param {Array<String>} optional optional classes
     */
    unhighlight(targetName, required, optional)
    {
        /** @type {Array<String>} */
        const toRemove = new Array();

        this.highlight_map.delete(targetName);

        const map_values = this.highlight_map.values();

        if(required)
        {
            for (let i = 0; i < required.length; i++) {
                toRemove.push(required[i]);
            }
        }

        /** @type {Boolean} */
        let isFind;

        for(let i = 0; i < optional.length; i++)
        {
            isFind = false;
            for (const classes of map_values)
            {
                if(classes[1].indexOf(optional[i]) == -1)
                {
                    isFind = true;
                    toRemove.push(optional[i]);
                }
            }
            
            if(!isFind)
            {
                toRemove.push(optional[i]);
            }
        }

        if(toRemove.length > 0)
        {
            this.#select_element.classList.remove(...toRemove);
        }
    }
}

class Grid
{
    /** @type {Grid} */
    static _instance;

    /** @type {User} user */
    user;
    /** @type {Array<Monster>} monsters */
    monsters;
    /** @type {Array<Array<Cell>>} Cells */
    cells = new Array();
    /** @type {HTMLElement} parent HTML element */
    parent;
    /** @type {HTMLElement} parent HTML element */
    container;
    /** @type {Number} width */
    width;
    /** @type {Number} height */
    height;
    /** @type {Array<Array<Number>>} level map data */
    levelData;

    /** @type {Point2D} size of all cells */
    _cell_size = new Point2D(32, 32);
    /** @type {Point2D} offset */
    offset = new Point2D(32, 32);

    /** @type {Number} auto move monsters to user timer in seconds*/
    timer_auto_move_monsters = 3;

    /**
     * 
     * @param  {HTMLElement} parent parent HTML element
     * @param  {Array<Array<Number>>} levelTilesData level tiles map data
     * @param  {Array<Array<Number>>} levelWalkableData level walkable map data
     * @param  {Point2D} userPoint N, M point to place User
     * @param  {Array<Point2D>} monsterPoints Array<N, M> points to place Monsters
     */
    constructor (parent, levelTilesData, levelWalkableData, userPoint, monsterPoints)
    {
        Grid._instance = this;

        this.monsters = new Array();

        this.parent = parent;
        this.levelData = levelTilesData;
        this.levelWalkableData = levelWalkableData;

        this.height = levelTilesData.length;
        this.width = levelTilesData[0].length; // !!!! fix

        this.offset = new Point2D((this.width - 1) * this._cell_size.x / 2, 0);

        this.container = document.createElement('div');
        this.container.className = 'grid_container';
        this.container.style.left = this.offset.x + 'px';
        this.container.style.top = this.offset.y + 'px';

        parent.appendChild(this.container)

        parent.style.width = this.width * this._cell_size.x + 'px';
        parent.style.height = (this.height + 1) * this._cell_size.y / 2 + 'px';
        
        for (let i = 0; i < levelTilesData.length; i++) // Y
        {
            this.cells[i] = new Array();

            for (let j = 0; j < levelTilesData[i].length; j++) // X
            {
                this.cells[i].push(
                    new Cell(
                        new Point2D(j, i),
                        this._cell_size,
                        levelTilesData[i][j],
                        this.container,
                        this.offset
                    )
                )
            }
        }

        parent.addEventListener("mousemove", (e) => {
            const coord = new Point2D(e.clientX - parent.offsetLeft - this.container.offsetLeft, e.clientY - parent.offsetTop - this.container.offsetTop);
            
            this.selectCell(coord);
        });

        parent.addEventListener("click", (e) => {
            const coord = new Point2D(e.clientX - parent.offsetLeft - this.container.offsetLeft, e.clientY - parent.offsetTop - this.container.offsetTop);
            
            this.moveUser(coord);
        });
        
        this.placeUser(userPoint);
        this.placeMonsters(monsterPoints);

        //this.#autoMoveMonstersToUser();
    }

    /**
     * 
     * @param {Point2D} point N, M user start position
     */
    placeUser(point)
    {
        let coord = new Point2D(
            point.x * this._cell_size.x / 2,
            point.y * this._cell_size.y / 2
        )

        this.user = new User(CoordHelper.cartToIso(coord), new Point2D(32, 32), 0, this.container);
        
        const _this = this;
        this.user.addEventListener("onPointChanged", function (e) {
            _this.showAvailableMoveCells(e.detail.value(), e.target, true);
            _this.moveMonstersToUser();
        });

        this.user.setPoint(point);

    }

    /**
     * 
     * @param {Array<Point2D>} point  Array<N, M> monsters start position
     */
    placeMonsters(points)
    {
        for (let i = 0; i < points.length; i++) {
            this.placeMonster(points[i], 0);
        }
    }

    /**
     * 
     * @param {Point2D} point 
     * @param {User | Monster} target 
     * @param {bool} isUnselectAll
     */
    showAvailableMoveCells(point, target, isUnselectAll)
    {        
        for(let i = 0; i < target.highlightedCells.length; i++)
        {
            target.highlightedCells[i].unhighlight(target.name, ['available_move2_' + target.name], [target.available_move_class])
        }

        target.highlightedCells = new Array();

        for (let i = -target.max_move_steps; i <= target.max_move_steps; i++)
        {
            for (let j = -target.max_move_steps; j <= target.max_move_steps; j++)
            {
                let curPoint = new Point2D(point.x + j, point.y + i);

                if(curPoint.x < 0 || curPoint.y < 0)
                {
                    continue;
                }

                if(curPoint.y >= this.cells.length || curPoint.x >= this.cells[curPoint.y].length)
                {
                    continue;
                }

                if(curPoint.equal(target.point) || !target.cellAvailableToMove(curPoint, this.levelWalkableData))
                {
                    continue;
                }

                target.highlightedCells.push(this.cells[curPoint.y][curPoint.x]);
                this.cells[curPoint.y][curPoint.x].highlight(target.name, ['available_move2_' + target.name], [target.available_move_class]);
                
            }
        }
    }

    /**
     * 
     * @param {Point2D} point N, M monster start position
     * @param {Number} image_index image index
     */
    placeMonster(point, image_index)
    {
        let coord = new Point2D(
            point.x * this._cell_size.x / 2,
            point.y * this._cell_size.y / 2
        )

        const monster = new Monster(CoordHelper.cartToIso(coord), new Point2D(32, 32), image_index, this.container);

        const _this = this;
        monster.addEventListener("onPointChanged", function (e) {
            _this.showAvailableMoveCells(e.detail.value(), e.target);
            _this.showAvailableMoveCells(_this.user.point, _this.user, true);
        });

        monster.setPoint(point);

        this.monsters.push(monster);
    }
    
    /**
     * 
     * @param {Point2D} point 
     */
    moveUser(point)
    {
        let coord = new Point2D(
            point.x * this._cell_size.x / 2,
            point.y * this._cell_size.y / 2
        )

        const coord_cart = CoordHelper.isoToCart(point);
        const coord_cart_fix = new Point2D(coord_cart.x - this._cell_size.x/2, coord_cart.y);

        const coord_tile = CoordHelper.getTileCoordinates(coord_cart_fix, this._cell_size.y / 2)

        let cell = null;
        
        if(!this.user.cellAvailableToMove(coord_tile, this.levelWalkableData))
        {
            return;
        }

        if(this.cells[coord_tile.y] && this.cells[coord_tile.y][coord_tile.x])
        {
            cell = this.cells[coord_tile.y][coord_tile.x];
        }

        if(!cell)
        {
            return;
        }

        this.user.move(cell.coord, cell.point);
    }

    /**
     * !!!!! Test
     */
    #autoMoveMonstersToUser()
    {
        const _this = this;

        window.setInterval(function () {
            _this.moveMonstersToUser();
        }, this.timer_auto_move_monsters * 1000);
    }

    /**
     * 
     */
    moveMonstersToUser()
    {

        for (let i = 0; i < this.monsters.length; i++) {

            let path = CoordHelper.findPath(this.monsters[i].point, this.user.point, this.levelWalkableData);
            let minDistPoint = path.slice(-this.monsters[i].max_move_steps).shift();

            if(minDistPoint == undefined)
            {
                continue;
            }

            // проверка не попадает ли путь прямо на юзера
            if(minDistPoint.equal(this.user.point))
            {
                minDistPoint = path.slice(-this.monsters[i].max_move_steps + 1).shift()
            }

            // костыль, фильтр для случая когда монстр в соседней клетке
            if(minDistPoint.equal(this.user.point))
            {
                continue;
            }

            console.log(minDistPoint);

            const cell = this.cells[minDistPoint.y][minDistPoint.x];
    
            if(!cell)
            {
                continue;
            }
            
            this.monsters[i].move(cell.coord, cell.point);

            this.levelWalkableData[this.monsters[i].point.y][this.monsters[i].point.x] = 1;
            this.levelWalkableData[cell.point.y][cell.point.x] = 0;
        }
    }

    selectCell(point)
    {
        const coord_cart = CoordHelper.isoToCart(point);
        const coord_cart_fix = new Point2D(coord_cart.x - this._cell_size.x/2, coord_cart.y);

        const coord_tile = CoordHelper.getTileCoordinates(coord_cart_fix, this._cell_size.y / 2)
                
        let cell = null;

        if(this.cells[coord_tile.y] && this.cells[coord_tile.y][coord_tile.x])
        {
            cell = this.cells[coord_tile.y][coord_tile.x];
        }

        if(cell)
        {
            cell.select(this.user.cellAvailableToMove(coord_tile, this.levelWalkableData));
        }
    }

}


const Game = {
    Point2D,
    Cell,
    Grid,
}

exports = Game;
