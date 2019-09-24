var Star = /** @class */ (function () {
    function Star(type, row, col) {
        // 宽度
        this.width = 40;
        // 高度
        this.height = 40;
        this.row = row;
        this.col = col;
        this.type = type;
    }
    /**
     * 创建div，给div添加一些样式
     */
    Star.prototype.createBlock = function () {
        var _a = this, width = _a.width, height = _a.height, div = document.createElement('div');
        div.type = this.type;
        div.row = this.row;
        div.col = this.col;
        div.className = 'star';
        div.style.width = this.width + "px";
        div.style.height = this.height + "px";
        div.style.display = "inline-block";
        div.style.position = "absolute";
        div.style.boxSizing = "border-box";
        div.style.borderRadius = "1.2rem";
        return div;
    };
    return Star;
}());
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
        // 星星宽度
        this.starWidth = 40;
        // 星星高度
        this.starHeight = 40;
        // 行数
        this.rows = 10;
        // 列数
        this.cols = 10;
        // 游戏界面
        this.container = document.querySelector('.pop_star');
        // 目标分数的dom
        this.targetScoreDom = document.querySelector('.target_score');
        // 当前分数的dom
        this.currentScoreDom = document.querySelector('.current_score');
        // 目标分数
        this.targetScore = 2000;
        // 当前分数
        this.currentScore = 0;
        // 目标分数dom的提示信息
        this.targetDomTips = '目标分数：';
        // 当前分数dom的提示信息
        this.currentDomTips = '当前分数：';
        // 星星的二维数组集合
        this.square = [];
        // 选中的星星
        this.choosedStar = [];
        // 星星闪烁的计时器
        this.flickTimer = null;
        // 递增分
        this.stepScore = 10;
        // 基础分
        this.baseScore = 5;
        // 选择计算分数的dom
        this.selectScoreDom = document.querySelector('.selecting_score');
        // 选择分数
        this.selectedScore = 0;
        // 是否处于消除星星状态
        this.isAnimating = false;
        // 检查游戏结束的二维数组
        this.checkFinishStar = [];
        // 总分数
        this.totalScore = 0;
        // 等级
        this.level = 1;
        // 目标分数递增分数
        this.stepTargetScore = 1000;
        /**
         * 点击事件的监听
         * @param event
         */
        this.mouseClickListener = function (event) {
            if (event.target.className === 'star') {
                _this.handleMouseClick(event.target);
            }
        };
        /**
         * 鼠标移入事件的监听
         * @param event
         */
        this.mouseOverListener = function (event) {
            if (event.target.className === 'star') {
                _this.handleMouseOver(event.target);
            }
        };
        // 初始化基础信息
        this.initBase();
        // 初始化二维数组
        this.initSquare();
        // 绑定监听
        this.addListener();
    }
    /**
     * 绑定监听
     */
    Game.prototype.addListener = function () {
        this.container.addEventListener('mouseover', this.mouseOverListener);
        this.container.addEventListener('click', this.mouseClickListener);
    };
    /**
     * 移除监听
     */
    Game.prototype.removeListener = function () {
        this.container.removeEventListener('mouseover', this.mouseOverListener);
        this.container.removeEventListener('click', this.mouseClickListener);
    };
    /**
     * 点击星星的处理函数
     * @param target 点中的星星
     */
    Game.prototype.handleMouseClick = function (target) {
        var _this = this;
        var _a = this, currentScoreDom = _a.currentScoreDom, flickTimer = _a.flickTimer, currentDomTips = _a.currentDomTips, square = _a.square, choosedStar = _a.choosedStar, selectedScore = _a.selectedScore, container = _a.container, length = choosedStar.length;
        // 计算总份数
        this.totalScore += selectedScore;
        Game.changeScore(currentScoreDom, this.totalScore, currentDomTips);
        // 在星星移动期间设置锁
        if (this.isAnimating || length < 2) {
            return;
        }
        this.isAnimating = true;
        var _loop_1 = function (i) {
            setTimeout(function () {
                var star = choosedStar[i];
                square[star.row][star.col] = null;
                container.removeChild(choosedStar[i]);
            }, i * 100);
        };
        // container移除dom，square移除dom
        for (var i = 0; i < length; i++) {
            _loop_1(i);
        }
        // 清除定时器
        if (flickTimer !== null) {
            clearInterval(flickTimer);
        }
        // 下落
        setTimeout(function () {
            _this.doMove();
            setTimeout(function () {
                var finished = _this.checkFinish();
                console.log(finished);
                if (finished) {
                    _this.clear();
                    if (_this.totalScore >= _this.targetScore) {
                        alert("恭喜获胜");
                        _this.targetScore += _this.level * _this.stepTargetScore;
                        _this.level++;
                    }
                    else {
                        alert("游戏失败");
                        _this.targetScore = 2000;
                        _this.level = 0;
                        _this.totalScore = 0;
                    }
                    _this.isAnimating = false;
                    new Game();
                }
                else {
                    choosedStar = [];
                    _this.isAnimating = false;
                }
            }, 300 + length * 150);
        }, length * 100);
    };
    Game.prototype.clear = function () {
        var _a = this, square = _a.square, container = _a.container, rows = square.length;
        for (var row = 0; row < rows; row++) {
            var cols = square[row].length;
            for (var col = 0; col < cols; col++) {
                if (square[row][col] === null) {
                    continue;
                }
                container.removeChild(square[row][col]);
                square[row][col] = null;
            }
        }
        this.removeListener();
    };
    Game.prototype.checkFinish = function () {
        // 检查游戏结束的条件是，有无相连的相同的方块
        var square = this.square, rows = square.length;
        for (var row = 0; row < rows; row++) {
            var cols = square[row].length;
            for (var col = 0; col < cols; col++) {
                var temp = [];
                this.chooseStar(square[row][col], temp);
                if (temp.length > 1) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * 星星下落的函数
     */
    Game.prototype.doMove = function () {
        var _a = this, rows = _a.rows, cols = _a.cols, square = _a.square;
        // 纵向移动
        for (var col = 0; col < cols; col++) {
            var pointer = 0; // 设置一个指针
            for (var row = 0; row < rows; row++) {
                // 遇到一个不是null的位置，则pointer+1，直到遇到为null的位置停止增加，
                // 那么当前pointer的位置就表示了遇到的第一个为null的位置的行数
                if (square[row][col] !== null) {
                    if (row !== pointer) {
                        // 将row遍历到的非null的square[col][row]赋值给pointer遍历到的为null的square[pointer][row]
                        square[pointer][col] = square[row][col];
                        // 更新当前dom的row
                        square[row][col].row = pointer;
                        square[row][col] = null;
                    }
                    pointer++;
                }
            }
        }
        // 横向移动
        for (var i = 0; i < square[0].length;) {
            if (square[0][i] == null) {
                for (var j = 0; j < rows; j++) {
                    square[j].splice(i, 1);
                }
                continue;
            }
            i++;
        }
        this.refresh();
    };
    /**
     * 鼠标移入事件的处理函数
     * @param target 鼠标移入时的星星
     */
    Game.prototype.handleMouseOver = function (target) {
        if (target === null) { // 严谨判断
            return;
        }
        // 每次移入的时候，清空chooseStar
        this.choosedStar = [];
        // 找到与当前移入时type相同的星星，并将其推入已选中的星星数组
        this.chooseStar(target, this.choosedStar);
        // 如果星星数组长度小于2，则不做处理
        if (this.choosedStar.length < 2) {
            this.choosedStar = [];
            return;
        }
        // 如果星星数大于2，则让星星闪烁，并计算已选中的分数
        this.flickStar();
        this.showChoosedScore();
    };
    /**
     * 计算选中的分数并显示的函数
     */
    Game.prototype.showChoosedScore = function () {
        var _a = this, choosedStar = _a.choosedStar, baseScore = _a.baseScore, stepScore = _a.stepScore, selectScoreDom = _a.selectScoreDom, length = choosedStar.length, score = 0;
        // 计算已选中的分数
        for (var i = 0; i < length; i++) {
            score += baseScore + stepScore * i;
        }
        // 严谨判断
        if (score <= 0) {
            return;
        }
        // 样式设置
        this.selectedScore = score;
        selectScoreDom.style.opacity = '1';
        selectScoreDom.style.transition = null;
        selectScoreDom.innerHTML = length + "\u5757 " + this.selectedScore + "\u5206";
        setTimeout(function () {
            selectScoreDom.style.opacity = '0';
            selectScoreDom.style.transition = 'opacity 1s';
        }, 1000);
    };
    /**
     * 还原上一次选中的星星的样式
     */
    Game.prototype.clearFlick = function () {
        var _a = this, square = _a.square, flickTimer = _a.flickTimer, 
        // rows必须是现在的square的长度，因为会有消除星星的操作，可能square的长度不为this.rows
        rows = square.length;
        // 清空上一个定时器
        if (flickTimer !== null) {
            clearInterval(flickTimer);
        }
        for (var row = 0; row < rows; row++) {
            // cols也必须使现在square[row]的长度，因为会有消除星星的操作，可能square[row]的长度不为this.cols
            var cols = square[row].length;
            for (var col = 0; col < cols; col++) {
                var div = square[row][col];
                // 严谨判断
                if (div === null) {
                    continue;
                }
                // 还原样式
                div.style.border = '0px solid #BFEFFF';
                div.style.transform = 'scale(0.95)';
            }
        }
    };
    /**
     * 使星星闪烁的函数
     */
    Game.prototype.flickStar = function () {
        // 每次移入并闪烁之前将原来闪烁的星星恢复原状
        this.clearFlick();
        // 让选中的星星闪烁，即周期性地改变已选中星星的样式
        var choosedStar = this.choosedStar, length = choosedStar.length, num = 0;
        this.flickTimer = setInterval(function () {
            for (var i = 0; i < length; i++) {
                var div = choosedStar[i];
                div.style.border = "3px solid #BFEFFF";
                div.style.transform = "scale(" + (0.90 + Math.pow(-1, num) * 0.05) + ")";
            }
            num++;
        }, 300);
    };
    /**
     * 递归找出相连的星星
     * @param chooseDom 相对位置的星星
     * @param choosedArr 相连的星星数组
     */
    Game.prototype.chooseStar = function (chooseDom, choosedArr) {
        if (chooseDom === null) {
            return;
        }
        choosedArr.push(chooseDom);
        // 向左
        if (chooseDom.col > 0 && // 往左边走，当前的列数至少要大于0
            this.square[chooseDom.row][chooseDom.col - 1] && // 左边必须有元素
            this.square[chooseDom.row][chooseDom.col - 1].type === chooseDom.type && // 左边的元素type和选中的type一样
            !~choosedArr.indexOf(this.square[chooseDom.row][chooseDom.col - 1]) // 避免重复选取
        ) {
            this.chooseStar(this.square[chooseDom.row][chooseDom.col - 1], choosedArr);
        }
        // 往右
        if (chooseDom.col < this.cols - 1 && // 往右边走，当前的列数不能大于cols - 1（这样才能保证可以向右边走）
            this.square[chooseDom.row][chooseDom.col + 1] && // 右边必须有元素
            this.square[chooseDom.row][chooseDom.col + 1].type === chooseDom.type && // 右边的元素type和选中的type一样
            !~choosedArr.indexOf(this.square[chooseDom.row][chooseDom.col + 1]) // 避免重复选取
        ) {
            this.chooseStar(this.square[chooseDom.row][chooseDom.col + 1], choosedArr);
        }
        // 往上
        if (chooseDom.row > 0 && // 往上边走，行数至少大于0
            this.square[chooseDom.row - 1][chooseDom.col] && // 上边必须有元素
            this.square[chooseDom.row - 1][chooseDom.col].type === chooseDom.type && // 上边的元素type和选中的type一样
            !~choosedArr.indexOf(this.square[chooseDom.row - 1][chooseDom.col]) // 避免重复选取
        ) {
            this.chooseStar(this.square[chooseDom.row - 1][chooseDom.col], choosedArr);
        }
        // 往下
        if (chooseDom.row < this.rows - 1 &&
            this.square[chooseDom.row + 1][chooseDom.col] &&
            this.square[chooseDom.row + 1][chooseDom.col].type === chooseDom.type &&
            !~choosedArr.indexOf(this.square[chooseDom.row + 1][chooseDom.col])) {
            this.chooseStar(this.square[chooseDom.row + 1][chooseDom.col], choosedArr);
        }
    };
    /**
     * 初始化square数组
     */
    Game.prototype.initSquare = function () {
        var _a = this, rows = _a.rows, cols = _a.cols;
        // 性能问题，使用DocumentFragment
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < rows; i++) {
            this.square[i] = [];
            for (var j = 0; j < cols; j++) {
                var block = Game.createBlock(Game.getRandomNumber(), i, j);
                this.square[i][j] = block;
                fragment.append(block);
            }
        }
        this.container.append(fragment);
        // 重新设置星星的相关样式
        this.refresh();
    };
    /**
     * 渲染节点，被多次调用
     */
    Game.prototype.refresh = function () {
        var square = this.square, rows = square.length;
        for (var row = 0; row < rows; row++) {
            var cols = square[row].length;
            for (var col = 0; col < cols; col++) {
                var curSquare = square[row][col];
                // 严格判断
                if (curSquare === null) {
                    continue;
                }
                // 因为这个函数会调用多次，所以我们在每次渲染时重新分配行和列、以及在dom上的坐标
                curSquare.row = row;
                curSquare.col = col;
                // 给一个渐变
                curSquare.style.transition = "left 0.3s, bottom 0.3s";
                // 确定每个星星的位置
                curSquare.style.left = curSquare.col * this.starWidth + "px";
                curSquare.style.bottom = curSquare.row * this.starWidth + "px";
                // 根据星星的类型渲染图片
                curSquare.style.backgroundImage = "url(./img/" + curSquare.type + ".png)";
                curSquare.style.backgroundSize = "cover";
                // 让星星变小点，方便以后移入闪烁
                curSquare.style.transform = "scale(0.95)";
            }
        }
    };
    Game.createBlock = function (type, row, col) {
        var block = new Star(type, row, col);
        return block.createBlock();
    };
    Game.getRandomNumber = function () {
        return Math.floor(Math.random() * 5);
    };
    /**
     * 初始化棋盘上的分数、棋盘宽高等等
     */
    Game.prototype.initBase = function () {
        this.container.style.width = this.cols * this.starWidth + 'px';
        Game.changeScore(this.currentScoreDom, this.currentScore, this.currentDomTips);
        Game.changeScore(this.targetScoreDom, this.targetScore, this.targetDomTips);
    };
    /**
     * 静态方法：改变分数
     * @param dom 要改变分数的dom
     * @param score 改变的分数
     * @param tips 提示信息
     */
    Game.changeScore = function (dom, score, tips) {
        dom.innerHTML = tips + score;
    };
    return Game;
}());
new Game();
