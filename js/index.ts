class Star {
  // row 和 col分别表示星星在二维数组中的位置
  public row: number;
  public col: number;
  // 宽度
  public readonly width: number = 40;
  // 高度
  public readonly height: number = 40;
  // 类型，用于生成星星图片
  public type: number;

  constructor(type: number, row: number, col: number) {
    this.row = row;
    this.col = col;
    this.type = type
  }

  /**
   * 创建div，给div添加一些样式
   */
  public createBlock(): HTMLDivElement {
    let {width, height} = this, div: any = <any>document.createElement('div');
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
    return div
  }
}

class Game {
  // 星星宽度
  private starWidth: number;
  // 行数
  private readonly rows: number = 10;
  // 列数
  private readonly cols: number = 10;
  // 游戏界面
  private readonly container: HTMLDivElement = document.querySelector('.pop_star');
  // 目标分数的dom
  private readonly targetScoreDom: HTMLDivElement = document.querySelector('.target_score');
  // 当前分数的dom
  private readonly currentScoreDom: HTMLDivElement = document.querySelector('.current_score');
  // 目标分数
  private targetScore: number = 2000;
  // 当前分数
  private currentScore: number = 0;
  // 目标分数dom的提示信息
  private targetDomTips: string = '目标分数：';
  // 当前分数dom的提示信息
  private currentDomTips: string = '当前分数：';
  // 星星的二维数组集合
  private square: HTMLDivElement [][] = [];
  // 选中的星星
  private choosedStar: HTMLDivElement[] = [];
  // 星星闪烁的计时器
  private flickTimer: any = null;
  // 递增分
  private readonly stepScore: number = 10;
  // 基础分
  private readonly baseScore: number = 5;
  // 选择计算分数的dom
  private selectScoreDom: HTMLDivElement = document.querySelector('.selecting_score');
  // 选择分数
  private selectedScore: number = 0;
  // 是否处于消除星星状态
  private isAnimating: boolean = false;
  // 检查游戏结束的二维数组
  private checkFinishStar: HTMLDivElement[] = [];
  // 总分数
  private totalScore: number = 0;
  // 等级
  private level: number = 1;
  // 目标分数递增分数
  private stepTargetScore: number = 1000;

  constructor() {
    // 初始化基础信息
    this.initBase();
    // 初始化二维数组
    this.initSquare();
    // 绑定监听
    this.addListener()
  }

  /**
   * 绑定监听
   */
  private addListener(): void {
    this.container.addEventListener('mouseover', this.mouseOverListener);
    this.container.addEventListener('click', this.mouseClickListener);
  }

  /**
   * 移除监听
   */
  private removeListener(): void {
    this.container.removeEventListener('mouseover', this.mouseOverListener);
    this.container.removeEventListener('click', this.mouseClickListener);
  }

  /**
   * 点击事件的监听
   * @param event
   */
  private mouseClickListener = (event: MouseEvent): void => {
    if ((event.target as any).className === 'star') {
      this.handleMouseClick(event.target)
    }
  };

  /**
   * 点击星星的处理函数
   * @param target 点中的星星
   */
  private handleMouseClick(target: EventTarget): void {
    let {currentScoreDom, flickTimer, currentDomTips, square, choosedStar, selectedScore, container} = this, {length} = choosedStar;
    // 计算总份数
    this.totalScore += selectedScore;
    Game.changeScore(currentScoreDom, this.totalScore, currentDomTips);
    // 在星星移动期间设置锁
    if (this.isAnimating || length < 2) {
      return
    }
    this.isAnimating = true;
    // container移除dom，square移除dom
    for (let i = 0; i < length; i++) {
      setTimeout(function () {
        let star = <any>choosedStar[i];
        square[star.row][star.col] = null;
        container.removeChild(choosedStar[i]);
      }, i * 100);
    }
    // 清除定时器
    if (flickTimer !== null) {
      clearInterval(flickTimer)
    }
    // 下落
    setTimeout(() => {
      this.doMove();
      // 每次移动完成之后判断游戏是否结束
      setTimeout(() => {
        let finished: boolean = this.checkFinish();
        if (finished) {
          // 游戏结束之后清空container和square
          this.clear();
          if (this.totalScore >= this.targetScore) {
            alert("恭喜获胜");
            this.targetScore += this.level * this.stepTargetScore;
            this.level++;
          } else {
            alert("游戏失败");
            this.targetScore = 2000;
            this.level = 0;
            this.totalScore = 0;
          }
          this.isAnimating = false;
          new Game();
        } else {
          choosedStar = [];
          this.isAnimating = false;
        }
      }, 300 + length * 150);
    }, length * 100)
  }

  /**
   * 清空container和square星星的函数
   */
  private clear() {
    let {square, container} = this, rows = square.length;
    for (let row = 0; row < rows; row++) {
      let cols = square[row].length;
      for (let col = 0; col < cols; col++) {
        // 严谨判断
        if (square[row][col] === null) {
          continue;
        }
        // container移除dom
        container.removeChild(square[row][col]);
        // square当前位置置空
        square[row][col] = null;
      }
    }
    // 移除监听
    this.removeListener();
  }

  /**
   * 判断游戏是否结束的函数
   */
  private checkFinish(): boolean {
    // 检查游戏结束的条件是，在剩下的方块中有无相连的相同的方块
    let {square} = this, rows = square.length;
    for (let row = 0; row < rows; row++) {
      let cols = square[row].length;
      for (let col = 0; col < cols; col++) {
        // 设置当前的一个变量，表示相连的数组
        let temp: HTMLDivElement[] = [];
        this.chooseStar(square[row][col], temp);
        // 如果有连着的则游戏还未结束
        if (temp.length > 1) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 星星下落的函数
   */
  private doMove(): void {
    let {rows, cols, square} = this;
    // 纵向移动
    for (let col = 0; col < cols; col++) {
      let pointer: number = 0; // 设置一个指针
      for (let row = 0; row < rows; row++) {
        // 遇到一个不是null的位置，则pointer+1，直到遇到为null的位置停止增加，
        // 那么当前pointer的位置就表示了遇到的第一个为null的位置的行数
        if (square[row][col] !== null) {
          if (row !== pointer) {
            // 将row遍历到的非null的square[col][row]赋值给pointer遍历到的为null的square[pointer][row]
            square[pointer][col] = square[row][col];
            // 更新当前dom的row
            (square[row][col] as any).row = pointer;
            square[row][col] = null;
          }
          pointer++;
        }
      }
    }
    // 横向移动，若最下面的一行某一个为null的话，则表示当前行的当前列已为空，则删除每一行的当前列项
    for (let col = 0; col < square[0].length;) {
      if (square[0][col] == null) {
        for (let row = 0; row < rows; row++) {
          square[row].splice(col, 1);
        }
        continue;
      }
      // 因为删除某一列之后，后面的列会向前移动一列，
      // 如果我们在for循环的作用域里面增加col，则会跳过移动之后的列的检查，所以我们需要在在当前列不为空的时候进行col++
      col++;
    }
    // 每次移动完成之后，进行星星的重新渲染
    this.refresh();
  }

  /**
   * 鼠标移入事件的监听
   * @param event
   */
  private mouseOverListener = (event: MouseEvent): void => {
    if ((event.target as any).className === 'star') {
      this.handleMouseOver(event.target)
    }
  };

  /**
   * 鼠标移入事件的处理函数
   * @param target 鼠标移入时的星星
   */
  private handleMouseOver(target: EventTarget): void {
    if (target === null) {// 严谨判断
      return;
    }
    // 每次移入的时候，清空chooseStar
    this.choosedStar = [];
    // 找到与当前移入时type相同的星星，并将其推入已选中的星星数组
    this.chooseStar(target, this.choosedStar);
    // 如果星星数组长度小于2，则不做处理
    if (this.choosedStar.length < 2) {
      this.choosedStar = [];
      return
    }
    // 如果星星数大于2，则让星星闪烁，并计算已选中的分数
    this.flickStar();
    this.showChoosedScore();
  }

  /**
   * 计算选中的分数并显示的函数
   */
  private showChoosedScore() {
    let {choosedStar, baseScore, stepScore, selectScoreDom} = this, {length} = choosedStar, score = 0;
    // 计算已选中的分数
    for (let i = 0; i < length; i++) {
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
    selectScoreDom.innerHTML = `${length}块 ${this.selectedScore}分`;
    setTimeout(function () {
      selectScoreDom.style.opacity = '0';
      selectScoreDom.style.transition = 'opacity 1s';
    }, 1000)
  }

  /**
   * 还原上一次选中的星星的样式
   */
  private clearFlick(): void {
    let {square, flickTimer} = this,
        // rows必须是现在的square的长度，因为会有消除星星的操作，可能square的长度不为this.rows
        rows = square.length;
    // 清空上一个定时器
    if (flickTimer !== null) {
      clearInterval(flickTimer)
    }
    for (let row = 0; row < rows; row++) {
      // cols也必须使现在square[row]的长度，因为会有消除星星的操作，可能square[row]的长度不为this.cols
      let cols = square[row].length;
      for (let col = 0; col < cols; col++) {
        let div = square[row][col];
        // 严谨判断
        if (div === null) {
          continue;
        }
        // 还原样式
        div.style.border = '0px solid #BFEFFF';
        div.style.transform = 'scale(0.95)'
      }
    }
  }

  /**
   * 使星星闪烁的函数
   */
  private flickStar(): void {
    // 每次移入并闪烁之前将原来闪烁的星星恢复原状
    this.clearFlick();
    // 让选中的星星闪烁，即周期性地改变已选中星星的样式
    let {choosedStar} = this, {length} = choosedStar, num = 0;
    this.flickTimer = setInterval(() => {
      for (let i = 0; i < length; i++) {
        let div: HTMLDivElement = choosedStar[i];
        div.style.border = "3px solid #BFEFFF";
        div.style.transform = `scale(${0.90 + Math.pow(-1, num) * 0.05})`
      }
      num++;
    }, 300)
  }

  /**
   * 递归找出相连的星星
   * @param chooseDom 相对位置的星星
   * @param choosedArr 相连的星星数组
   */
  private chooseStar(chooseDom: any, choosedArr: HTMLDivElement[]) {
    // 递归的出口：找不到dom
    if (chooseDom === null) {
      return
    }
    choosedArr.push(chooseDom);
    // 向左
    if (chooseDom.col > 0 && // 往左边走，当前的列数至少要大于0
        this.square[chooseDom.row][chooseDom.col - 1] && // 左边必须有元素
        (this.square[chooseDom.row][chooseDom.col - 1] as any).type === chooseDom.type && // 左边的元素type和选中的type一样
        !~choosedArr.indexOf(this.square[chooseDom.row][chooseDom.col - 1]) // 避免重复选取
    ) {
      this.chooseStar(this.square[chooseDom.row][chooseDom.col - 1], choosedArr)
    }
    // 往右
    if (chooseDom.col < this.cols - 1 && // 往右边走，当前的列数不能大于cols - 1（这样才能保证可以向右边走）
        this.square[chooseDom.row][chooseDom.col + 1] && // 右边必须有元素
        (this.square[chooseDom.row][chooseDom.col + 1] as any).type === chooseDom.type && // 右边的元素type和选中的type一样
        !~choosedArr.indexOf(this.square[chooseDom.row][chooseDom.col + 1]) // 避免重复选取
    ) {
      this.chooseStar(this.square[chooseDom.row][chooseDom.col + 1], choosedArr)
    }
    // 往上
    if (chooseDom.row > 0 && // 往上边走，行数至少大于0
        this.square[chooseDom.row - 1][chooseDom.col] && // 上边必须有元素
        (this.square[chooseDom.row - 1][chooseDom.col] as any).type === chooseDom.type && // 上边的元素type和选中的type一样
        !~choosedArr.indexOf(this.square[chooseDom.row - 1][chooseDom.col]) // 避免重复选取
    ) {
      this.chooseStar(this.square[chooseDom.row - 1][chooseDom.col], choosedArr)
    }
    // 往下
    if (chooseDom.row < this.rows - 1 &&
        this.square[chooseDom.row + 1][chooseDom.col] &&
        (this.square[chooseDom.row + 1][chooseDom.col] as any).type === chooseDom.type &&
        !~choosedArr.indexOf(this.square[chooseDom.row + 1][chooseDom.col])
    ) {
      this.chooseStar(this.square[chooseDom.row + 1][chooseDom.col], choosedArr)
    }
  }

  /**
   * 初始化square数组
   */
  private initSquare() {
    const {rows, cols} = this;
    // 性能问题，使用DocumentFragment
    let fragment: DocumentFragment = document.createDocumentFragment();
    for (let i = 0; i < rows; i++) {
      this.square[i] = [];
      for (let j = 0; j < cols; j++) {
        let block: HTMLDivElement = this.createBlock(Game.getRandomNumber(), i, j);
        this.square[i][j] = block;
        fragment.append(block)
      }
    }
    this.container.append(fragment);
    // 重新设置星星的相关样式
    this.refresh()
  }

  /**
   * 渲染节点，被多次调用
   */
  private refresh(): void {
    let {square} = this, rows = square.length;
    for (let row = 0; row < rows; row++) {
      let cols = square[row].length;
      for (let col = 0; col < cols; col++) {
        let curSquare: any = square[row][col];
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
        curSquare.style.backgroundImage = `url(./img/${curSquare.type}.png)`;
        curSquare.style.backgroundSize = "cover";
        // 让星星变小点，方便以后移入闪烁
        curSquare.style.transform = "scale(0.95)";
      }
    }
  }

  /**
   * 创建星星对象
   * @param type
   * @param row
   * @param col
   */
  private createBlock(type: number, row: number, col: number) {
    let block: Star = new Star(type, row, col);
    this.starWidth = block.width;
    return block.createBlock();
  }

  /**
   * 静态函数，生成0-4的随机数字来表示星星的type
   */
  private static getRandomNumber(): number {
    return Math.floor(Math.random() * 5)
  }

  /**
   * 初始化棋盘上的分数、棋盘宽高等等
   */
  private initBase(): void {
    this.container.style.width = this.cols * this.starWidth + 'px';
    Game.changeScore(this.currentScoreDom, this.currentScore, this.currentDomTips);
    Game.changeScore(this.targetScoreDom, this.targetScore, this.targetDomTips);
  }

  /**
   * 静态方法：改变分数
   * @param dom 要改变分数的dom
   * @param score 改变的分数
   * @param tips 提示信息
   */
  private static changeScore(dom: HTMLDivElement, score: number, tips: string): void {
    dom.innerHTML = tips + score
  }
}

new Game();
