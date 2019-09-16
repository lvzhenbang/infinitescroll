import defaults from '../config/defaults';
import version from '../config/version';

import inBrowser from './utils/inBrowser';

const tip = {
  loading: '数据加载中...',
  end: '这是我的底线！',
  nodata: '没有相关数据',
  fail: '加载数据失败',
};

class Infinitescroll {
  constructor(el, opt) {
    this.$el = el;
    this.options = {
      ...defaults,
      ...opt,
    };
    this.tip = null;
    this.page = this.options.current;
    this.init();
    this.version = version;
  }

  init() {
    if (!this.$el) {
      throw new Error('this.$el must be exists.');
    }

    this.genTip();
    this.scroll();
    this.observer.observe(this.tip);

    if (!this.page) {
      this.setTip(tip.nodata);
      this.observer.unobserve(this.tip);
    }

    this.renderData();
  }

  renderData() {
    if (this.options.callback) {
      const nodes = this.options.callback(this);
      if (nodes) {
        this.$el.insertBefore(nodes, this.tip);
        this.page += 1;
      } else {
        this.setTip(tip.fail);
        this.observer.unobserve(this.tip);
      }
    } else {
      throw new Error('this.options.callback must be exists for render data.');
    }
  }

  genTip() {
    this.tip = document.createElement('div');
    this.tip.classList.add('infinitescroll-tip');
    this.setTip(tip.loading);
    this.$el.appendChild(this.tip);
  }

  setTip(text) {
    this.tip.innerText = text;
  }

  scroll() {
    this.observer = new window.IntersectionObserver((entries) => {
      if (entries[0] && (entries[0].isIntersecting || entries[0].intersectionRatio > 0)) {
        if (this.page === this.options.pages) {
          this.setTip(tip.end);
          this.observer.unobserve(this.tip);
        } else {
          this.observer.unobserve(this.tip);
          this.observer.observe(this.tip);
          this.renderData();
        }
      }
    }, {
      root: this.options.container === document ? null : this.options.container,
      rootMargin: `${this.options.threshold}px`,
    });
  }
}

if (inBrowser) {
  window.Infinitescroll = Infinitescroll;
  window.console.log('plugin is running browser.');
}

export default Infinitescroll;
