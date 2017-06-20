import low from 'lowdb';
import config from '../robot/config';
import fs from 'fs';

const dbGit = low('gitsInMag.json');

// 连接服务
const gitlab = require('gitlab')({
    url: config.gitlabUrl,
    token: config.gitlabToken
});

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
    }],
    ['张永聪', {
        'status': [0, 0, 0, 0],
        'name': 'SDN'
    }],
    ['杜大江', {
        'status': [0, 0, 0, 0],
        'name': '内部项目（文档）'
    }],
    ['王瑞华', {
        'status': [0, 0, 0, 0],
        'name': 'NFV'
    }]
]);
let ActiveDay = new Date();
ActiveDay.setDate(ActiveDay.getDate() - config.changeDay);

function printJSONDB(str) {
    var show = dbGit.has(str);
    console.log(str + '在不在?' + show);
};

// 读取config文件中的git信息，将其写入到新的json中
const init = () => {
    let gitsInMag = config.gits;
    // var gitsInMag = dbGit.get('gitsInMag').value();
    // var str = JSON.stringify(gits);
    // var numArr = JSON.parse(str);
    // console.log('----:' + gitsInMag.length);
    dbGit.set('gitsInMag', gitsInMag).value();
};

let ret = '';
// 列出所有项目，并把gitlab上面所有的项目写到gitsInMag.json中去
//  gitsInMag.json有两个属性：
// gitsInMag是我们管理的git项目
// gitInAll是gitlab上面建立的所有git项目，数量较多，有些是无用的
// const listAllProject = async() => {
//     ret = '开始记录：';
//     console.log(ret);
//     await gitlab.projects.all(function(projects) {
//         try {
//             console.log(projects.length);
//             dbGit.set('gitsInAll', projects).value();
//             ret = '列出所有的gitlab上面的项目';
//             console.log(ret);
//         } catch (e) {
//             console.log('列gitlab项目列表时出错' + e.message);
//         };
//     });
// };

const listAllProject = async() => {
    return await new Promise(function(resolve, reject) {
        gitlab.projects.all(function(projects) {
            try {
                // console.log(projects.length);
                dbGit.set('gitsInAll', projects).value();
                ret = '列出所有的gitlab上面的项目';
                // console.log(ret);
                resolve(ret);
            } catch (e) {
                reject('列gitlab项目列表时出错');
            };
        });
    });
};

// 从db中找gitsInMag和gitInAll的匹配情况，如果能找到，得到该git的id号，然后去找该项目的分支
// 1）如果在gitInAll中找不到id，则status = 0， 说明地址写错了，无法找到该项目
const findManGitBranchesInAllProject = async() => {
    console.log('开始进行分支匹配');
    var gitsInMag = dbGit.get('gitsInMag').value();
    var gitsInAll = dbGit.get('gitsInAll').value();
    console.log('----' + gitsInMag.length);
    console.log('----' + gitsInAll.length);
    ret = '分支匹配:';
    // for (let git of gitsInMag) {
    for (let i = 0; i < gitsInMag.length; i++) {
        let git = gitsInMag[i];
        await findBranches(git, gitsInAll);
    };
    console.log(ret);
};

const findBranches = async(git, gitsInAll) => {
    try {
        let status = 0;
        let gitId = -100;

        let namespace = git.gitGroup + '/' + git.id;
        let xGitlab = gitsInAll.filter(function(x) {
            return x.path_with_namespace === namespace;
        });
        console.log(xGitlab.length);
        if (xGitlab.length !== 1) {
            status = 0;
            console.log('有问题的：' + namespace);
            ret += '问题：' + git.name;
            dbGit.get('gitsInMag')
                .find({
                    id: gitId
                })
                .assign({
                    status: status
                })
                .value();
        } else {
            gitId = xGitlab[0].id;
            // console.log('查看ID' + gitId + git.id);
            await listBranches(gitId, git.gitGroup, git.id);
            // console.log('查看IDok-' + gitId + git.id);
        };
    } catch (e) {
        console.log('查询分支出错' + e.message);
    }
};

const listBranches = async(gitlabId, gitGroup, gitId) => {
    return new Promise(function(resolve, reject) {
        try {
            var ret = 'listBranches:118';
            gitlab.projects.repository.listBranches(gitlabId, function(branches) {
                // dbGit.set('branches', branches).value();
                // console.log('查找' + gitId);
                // 将branches进行分析，得到其status和branchesName
                let gitStatus = getGitStatusFromBranches(gitGroup, branches);
                dbGit.get('gitsInMag')
                    .find({
                        id: gitId,
                        gitGroup: gitGroup
                    })
                    .assign({
                        status: gitStatus.status,
                        branchesName: gitStatus.branchesName,
                        gitlabId: gitlabId,
                        branches: branches
                    })
                    .value();
                // console.log(ret);
                resolve(ret);
            });
        } catch (e) {
            reject('在gitlab中找分支出错' + e.message);
        }
    });
};

// 2）如果在gitInAll中找到分支，做以下判断
// A：如果分支数为1，说明只建立了一个分支，则该项目只有一个maste分支，有重大问题，status = 0
// B：如果分支数为2，如果修改时间在5天以内，说明可能直接在主干分支修改，有重大问题，status = 0
// C：如果分支数为2，如果修改时间在5天以以上，说明没有修改，已经稳定了，status = 1
// D：如果分支数为3以上，如果修改时间在5天以上，说明没有修改，已经稳定了，status = 2
// E：如果分支数为3以上，如果修改时间在5天以内，说明处于正常管理的活跃分支，status = 3
// 判断结束后，需要给gitsInMag该项目增加三个属性
// 1) status，
// 2）gitId:  gitlab上的id值
// 3) branches:调用gitlab.projects.repository.listBranches得到所有的分支信息
const getGitStatusFromBranches = (gitGroup, branches) => {
    let ret = {
        status: 0,
        branchesName: ''
    };
    let ifActive = false;
    let branchesName = '';
    for (let i = 0; i < branches.length; i++) {
        let branchDateStr = branches[i].commit.committed_date;
        let branchDate = new Date(branchDateStr);
        if (branchDate > ActiveDay) {
            ifActive = true;
        }
        branchesName += branches[i].name + '[' + branchDateStr.substr(0, 10) + '][' + branches[i].commit.committer_name + ']  ';
    }
    ret.branchesName = branchesName;
    switch (branches.length) {
        case 0:
            ret.status = 0;
            break;
        case 1:
            if (gitGroup === 'irms.doc') {
                if (ifActive) {
                    ret.status = 3;
                } else {
                    ret.status = 1;
                }
            } else {
                ret.status = 0;
            }

            break;
        case 2:
            if (ifActive) {
                ret.status = 0;
            } else {
                ret.status = 1;
            }
            break;
        default:
            if (ifActive) {
                ret.status = 3;
            } else {
                ret.status = 2;
            }
            break;
    }
    return ret;
};

let outputFile = 'Git' + new Date().toLocaleDateString() + '.md';

const printGit = () => {
    let gitAll = dbGit.get('gitsInMag').value();
    fs.writeFileSync(outputFile, '');
    printAll(gitAll);
    printError(gitAll);
    printActive(gitAll);
};

const printAll = (gits) => {
    gits.forEach(x => {
        try {
            let name = x.developManager;
            // if (name) {
            //     console.log('---------------' + x.name);
            // };
            let a = gitMap.get(name);
            a.status[x.status]++;
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    });
    let strdata = '';
    strdata += '  \n';
    strdata += '产品名称 | Git项目总数 | 问题项目  | 稳定项目（2分支） | 稳定项目（3分支以上） | 活跃项目 \n';
    strdata += '---|---|---|---|---|--- \n';
    let sumAll = 0;
    for (var x of gitMap) {
        let gitnumber = x[1].status[0] + x[1].status[1] + x[1].status[2] + x[1].status[3];
        strdata += x[1].name + '| ' + gitnumber + '| ' + x[1].status[0] + '| ' + x[1].status[1] + '| ' + x[1].status[2] + '| ' + x[1].status[3] + '\n';
        sumAll += gitnumber;
    };
    strdata += '总项目数为：' + sumAll + '\n';
    fs.appendFileSync(outputFile, strdata);
    console.log(strdata);
};

const printError = (gits) => {
    let errordata = '';
    errordata += '--- \n';
    errordata += '有问题的Git项目如下: \n';
    errordata += '  \n';
    errordata += ' 负责人 | Git项目名称  | 分支数 | 分支更新情况 \n';
    errordata += '---|---|---|--- \n';
    let n = 0;
    gits.forEach(x => {
        try {
            // console.log(x.name);
            if (x.status === 0) {
                n++;
                errordata += x.developManager + '| ' + '[' + x.name + '](' + x.url + ') | ' + x.branches.length + ' |' + x.branchesName + ' \n';
            }
        } catch (e) {
            console.log(JSON.stringify(e));
        };
    });
    errordata += '总数为：' + n + '\n';
    fs.appendFileSync(outputFile, errordata);
    console.log(errordata);
};

const printActive = (gits) => {
    let strdata = '';
    strdata += '--- \n';
    strdata += '活跃项目中有问题的Git项目如下: \n';
    strdata += '  \n';
    strdata += ' 负责人 | Git项目名称  | 分支数 | 分支更新情况 \n';
    strdata += '---|---|---|--- \n';
    let n = 0;
    gits.forEach(x => {
        if ((x.status === 3) && (x.gitGroup !== 'irms.doc')) {
            let ret = checkActive(x);
            if (ret.status === false) {
                n++;
                strdata += x.developManager + '| ' + '[' + x.name + '](' + x.url + ') | ' + x.branches.length + ' |' + x.branchesName + ' ' + ret.reason + ' \n';
            }
        }
    });
    strdata += '总数为：' + n + '\n';
    fs.appendFileSync(outputFile, strdata);
    console.log(strdata);
};

const checkActive = (git) => {
    let ret = {
        status: true,
        reason: ''
    };
    let bs = git.branches;
    let dev = bs.filter((x) => {
        return x.name.toLowerCase().substr(0, 7) === 'develop';
    });
    let devtime = new Date(0);
    if (dev.length === 1) {
        if (dev[0].name !== 'develop') {
            ret.status = false;
            ret.reason += '[develop分支命名不规范]';
        }
        devtime = new Date(dev[0].commit.committed_date);
    } else if (dev.length < 1) {
        ret.status = false;
        ret.reason += '[没有develop分支]';
        return ret;
    } else {
        ret.status = false;
        ret.reason += '[develop分支不唯一]';
        return ret;
    };

    let master = bs.filter((x) => {
        return x.name.toLowerCase().substr(0, 7) === 'master';
    });
    let mastertime = new Date(0);
    if (master.length === 1) {
        if (master[0].name !== 'master') {
            ret.status = false;
            ret.reason += '[master分支命名不规范]';
        }
        mastertime = new Date(master[0].commit.committed_date);
    } else if (master.length < 1) {
        ret.status = false;
        ret.reason += '[没有master分支]';
        return ret;
    } else {
        ret.status = false;
        ret.reason += '[master分支不唯一]';
        return ret;
    };

    let feature = bs.filter((x) => {
        return x.name.toLowerCase().substr(0, 7) === 'feature';
    });
    let featuretime = new Date();
    feature.forEach((x) => {
        var r = /^\+?[1-9][0-9]*$/;
        if ((x.name.substr(0, 7) !== 'feature') || (!r.test(x.name.substr(-5)))) {
            ret.status = false;
            ret.reason += '[feature分支命名不规范]';
        };
        let tem = new Date(x.commit.committed_date);
        if (tem < featuretime) {
            featuretime = tem;
        }
    });
    // 如果最早的feature分支的时间比develop分支的时间还要晚，且该feature分支比今天早5天以上没更新，说明没有进行回归
    if ((featuretime > devtime) && (featuretime < ActiveDay)) {
        ret.status = false;
        ret.reason += '[feature分支可能没有及时回归develop]';
    };

    let release = bs.filter((x) => {
        return x.name.toLowerCase().substr(0, 7) === 'release';
    });
    let releasetime = new Date();
    release.forEach((x) => {
        if ((x.name.substr(0, 7) !== 'release') || (x.name.length === 7)) {
            ret.status = false;
            ret.reason += '[release分支命名不规范]';
        };
        let tem = new Date(x.commit.committed_date);
        if (tem < releasetime) {
            releasetime = tem;
        }
    });
    // 如果最早的feature分支的时间比develop分支的时间还要晚，且该feature分支比今天早5天以上没更新，说明没有进行回归
    if ((releasetime > mastertime) && (releasetime < ActiveDay)) {
        ret.status = false;
        ret.reason += '[release分支可能没有及时回归保护分支]';
    };

    let oldDay = new Date();
    oldDay.setDate(oldDay.getDate() - 20);
    if ((devtime < oldDay) || (mastertime < oldDay)) {
        ret.status = false;
        ret.reason += '[保护分支（develop和master）超过20天没更新，可能没有及时回归]';
    }
    return ret;
};

// printGit();

init();
listAllProject()
    .then(findManGitBranchesInAllProject)
    .then(function(ok) {
        console.log(ok);
        printGit();
    }).catch(function(err) {
        console.log(err);
    });
