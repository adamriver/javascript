import nightmare from 'nightmare';
import config from './config';
import runHelper from './runHelper';
import email from './email';
let nm = null;
let gitAll = new Array();
let gitMap = new Map([
    ['冒红蔚', {
        'status': [0, 0, 0, 0],
        'name': '家客管线'
    }],
    ['曹亮', {
        'status': [0, 0, 0, 0],
        'name': '开通调度'
    }],
    ['杨慧', {
        'status': [0, 0, 0, 0],
        'name': '平台割接'
    }],
    ['王姗姗', {
        'status': [0, 0, 0, 0],
        'name': '集团'
    }]
]);

const run1 = async() => {
    await email.sendMail('hello dudajiang', 'this is test');
};

const run = async() => {
    nm = nightmare({
        show: true,
        waitTimeout: config.nightmare.waitTimeout,
        webPreferences: {
            images: false
        }
    });
    // 登陆gitlab
    try {
        await runHelper.runTimes(login, config.run.times, config.run.timeout);
        console.log('登录成功');
    } catch (e) {
        await nm.end();
        console.log('登录失败'+JSON.stringify(e));
        return;
        // email.sendMail('[recruit robot]: 登录失败')
    }

    // 登陆成功后，访问每个git项目，看状态是否正常config.gits.length
    // try {
    //     for (let i = 0; i < config.gits.length; i++) {
    //         let git = config.gits[i];
    //         await checkGit(git);
    //     }
    // } catch (e) {
    //     await nm.end();
    //     console.log(e);
    //     return;
    // }

    // await nm.end();
    // // 查看各个项目的完成情况后，将情况输出成
    // printGit();
};

const login1 = async() => {
    await nm.goto(config.gitlabUrl + '/users/sign_in');
    // await nightmare.wait('#user_login');
    await nm.type('#user_login', config.username);
    await nm.type('#user_password', config.password);
    console.log('成功填写用户和密码');
    await nm.click('input[name="commit"]');
    await nm.wait('#logo');
    console.log('成功登陆');
};

const login = async() => {
    await nm.goto('https://lpn.boco.com.cn');
    console.log('成功登陆');
};

// 根据分支的时间值，判断分支修改的时间

const gitStatus = (bl) => {
    let ret = {
        'status': 0,
        'branchStatus': ''
    };
    let status = 0;
    let branchStatus = '';
    let changeday = 1000;
    for (let i = 0; i < bl.length; i++) {
        branchStatus += bl[i].name + ':' + bl[i].date + '   ';
        if (bl[i].status < changeday) {
            changeday = bl[i].status;
        };
    }
    switch (bl.length) {
        case 0:
            status = 0;
            break;
        case 1:
            status = 0;
            break;
        case 2:
            if (changeday < 5) {
                status = 0;
            } else {
                status = 1;
            }
            break;
        default:
            if (changeday < 5) {
                status = 3;
            } else {
                status = 2;
            }
            break;
    }
    ret.status = status;
    ret.branchStatus = branchStatus;
    return ret;
};

const checkGit = async(git) => {
    let copyGit = {};
    let gitUrl = config.gitlabUrl + git.url + '/branches';
    // console.log(gitUrl);

    copyGit['name'] = git.name;
    copyGit['id'] = git.id;
    copyGit['url'] = gitUrl;
    copyGit['developManager'] = git.developManager;
    // 到该git页所有的分支页面,如果出错说明该git项目地址有错误或者还没有建立
    await nm.goto(gitUrl);
    const sl = '.content-list.all-branches li';
    await nm.evaluate(selector => {
            let branchs = new Array();

            const liElement = document.querySelectorAll(selector);
            // 如果liElement为null，说明该git项目下面还没有任何分支

            for (var i = 0; i < liElement.length; i++) {
                let branch = {};
                let branchName = liElement[i].getAttribute('class');
                if (branchName) {
                    let bRealName = branchName.substring(10);
                    branch['name'] = bRealName;
                    let timeElement = liElement[i].children[1].children[2];
                    branch['date'] = timeElement.innerHTML;
                    let status = -1;
                    let str = timeElement.innerHTML;
                    if (str.indexOf('小时') > 0) {
                        status = 0;
                    } else if (str.indexOf('月') > 0) {
                        console.log(str);
                        status = 30;
                    } else if (str.indexOf('天') > 0) {
                        var a = str.split(' ');
                        status = a[0];
                    }
                    branch['status'] = status;
                    branchs.push(branch);
                }
            }

            return branchs;
        }, sl)
        .then(branchs => {
            // console.log(JSON.stringify(text));
            copyGit['branchs'] = branchs;
            if (branchs) {
                let ret = gitStatus(branchs);
                copyGit['status'] = ret.status;
                copyGit['branchStatus'] = ret.branchStatus;
            } else {
                console.log(copyGit['name'] + '有错误，请检查');
            }
        });
    gitAll.push(copyGit);
};

const printGit = () => {
    console.log(JSON.stringify(gitAll));
    console.log('11111');
    let errordata = '';
    errordata += '--- \n';
    errordata += '有问题的Git项目如下: \n';
    errordata += ' 负责人 | Git项目名称  | 分支数 | 分支更新情况 \n';
    errordata += '---|---|---|--- \n';
    gitAll.forEach(x => {
        try {
            let name = x.developManager;
            let a = gitMap.get(name);
            a.status[x.status]++;
            console.log(x.name);
            if (x.status === 0) {
                errordata += x.developManager + '| ' + '[' + x.name + '](' + x.url + ') | ' + x.branchs.length + ' |' + x.branchStatus + ' \n';
            }
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    });
    console.log('2222');
    let strdata = '';
    strdata += '产品名称 | Git项目总数 | 问题项目  | 稳定项目（2分支） | 稳定项目（3分支以上） | 活跃项目 \n';
    strdata += '---|---|---|---|---|--- \n';
    for (var x of gitMap) {
        let gitnumber = x[1].status[0] + x[1].status[1] + x[1].status[2] + x[1].status[3];
        strdata += x[1].name + '| ' + gitnumber + '| ' + x[1].status[0] + '| ' + x[1].status[1] + '| ' + x[1].status[2] + '| ' + x[1].status[3] + '\n';
    };
    let warningdata = '';
    warningdata += '--- \n';
    warningdata += '活跃项目中有问题的Git项目如下: \n';
    warningdata += ' 负责人 | Git项目名称  | 分支数 | 分支更新情况 \n';
    warningdata += '---|---|---|--- \n';
    gitAll.forEach(x => {
        if (x.status === 3) {
            warningdata += x.developManager + '| ' + '[' + x.name + '](' + x.url + ') | ' + x.branchs.length + ' |' + x.branchStatus + ' \n';
        }
    });
    console.log('4444');
    console.log(strdata);
    console.log(errordata);
    console.log(warningdata);
};

run();
