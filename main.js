import './style.css'
import 'jspsych/css/jspsych.css'
import { initJsPsych } from 'jspsych'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'

const jsPsych = initJsPsych({
  on_finish() {
    jsPsych.data.displayData()
  }
});

const preload = {
  type: jsPsychPreload,
  images: ['img/blue.png', 'img/orange.png']
};

const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "欢迎参加本次实验，按空格键开始。",
  choices: [' ']
};

const instructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>在本次实验中，屏幕中心会出现一个圆。</p><p>如果圆是<strong>蓝色</strong>，则你需要尽可能快的按下 "F" 键。</p>
    <p>如果圆是<strong>橙色</strong>，你需要以最快的速度按下 "J" 键。</p>
    <div style="width: 700px; display: flex; justify-content: center;">
    <div style="display: flex; flex-direction: column; align-items: center;">
      <img src="img/blue.png"></img>
      <p class="small"><strong>按 "F" 键</strong></p>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center;">
      <img src="img/orange.png"></img>
      <p class="small"><strong>按 "J" 键</strong></p>
    </div>
    </div>
    <p>按空格键开始。</p>
  `,
  post_trial_gap: 2000,
  choices: [' ']
};

const blue_trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: 'img/blue.png',
  choices: ['f', 'j']
}

const orange_trial = {
  type: jsPsychImageKeyboardResponse,
  stimulus: 'img/orange.png',
  choices: ['f', 'j']
}

const test_stimuli = [
  { stimulus: "img/blue.png", correct_response: 'f' },
  { stimulus: "img/orange.png", correct_response: 'j' }
]

const fixation = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div style="font-size:60px;">+</div>',
  choices: "NO_KEYS",
  trial_duration() {
    return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
  },
  data: {
    task: 'fixation'
  }
}

const test = {
  type: jsPsychImageKeyboardResponse,
  stimulus: jsPsych.timelineVariable('stimulus'),
  choices: ['f', 'j'],
  data: {
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish(data) {
    data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
  }
}

const test_procedure = {
  timeline: [fixation, test],
  timeline_variables: test_stimuli,
  randomize_order: true,
  repetitions: 3
}

const debrief_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus() {
    const trials = jsPsych.data.get().filter({ task: 'response' });
    const correct_trials = trials.filter({ correct: true });
    const accuracy = Math.round(correct_trials.count() / trials.count() * 100);
    const rt = Math.round(correct_trials.select('rt').mean());
    return `<p>您在 ${accuracy}% 的试验中回答正确。</p>
      <p>您的平均响应时间为 ${rt} 毫秒。</p>
      <p>按空格键即可完成实验。</p>`;
  },
  choices: [' ']
}

const timeline = [
  preload,
  welcome,
  instructions,
  blue_trial,
  orange_trial,
  test_procedure,
  debrief_block
]

jsPsych.run(timeline);
