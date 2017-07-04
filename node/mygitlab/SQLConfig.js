var SQLConfig = {
    db: {
        '任务列表': `SELECT id AS 禅道编号,
    (select name from zt_project where id=zt_task.project) as 所属项目 ,
    (select (select name from zt_product where id=zt_module.root) from zt_module where id=zt_task.module) as 所属模块,
    (CASE
    WHEN type='design'
    THEN '研发-设计'
    WHEN type='devel'
    THEN '研发-开发'
    WHEN type='bugfix'
    THEN '研发-bug处理'
    WHEN type='bug'
    THEN '研发-bug处理'
    WHEN type='model'
    THEN '研发-模型变更'
    WHEN type='reqmeeting'
    THEN '研发-需求评审'
    WHEN type='support'
    THEN '研发-支撑'
    WHEN type='req-1'
    THEN '需求-需求调研'
    WHEN type='req-2'
    THEN '需求-规划分析'
    WHEN type='req-3'
    THEN '需求-需求评审'
    WHEN type='req-4'
    THEN '需求-需求验证'
    WHEN type='req-5'
    THEN '需求-售前支持'
    WHEN type='test'
    THEN '测试-系统测试'
    WHEN type='test-1'
    THEN '测试-用例编写'
    WHEN type='test-2'
    THEN '测试-需求评审'
    WHEN type='pub'
    THEN '公共-事务'
    WHEN type='deploy'
    THEN '工程-项目实施'
    WHEN type='check'
    THEN '工程-验收'
    WHEN type='study'
    THEN '学习'
    WHEN type='per'
    THEN '个人-事务'
    ELSE ' 其他'
    END
    ) AS 任务类型,
    openedDate AS 任务创建时间
    FROM ZT_TASK`,
        '需求详细报表': `select id as 需求编号,
(select name from zt_product where id=zt_story.product) as 所属产品,
title as 需求名称,
openedDate as 需求创建时间,
reviewedDate as 需求评审时间,
(case when reviewedDate ='0000-00-00 00:00:00' then '未完成'  when null then '未完成' else '完成' end) as 评审是否完成,
myFunction2(id) as 研发开始时间,
myFunction(id) as 研发结束时间,
(case when myFunction(id) !='0000-00-00 00:00:00' then '完成' else '未完成' end) as 研发是否完成,
closedDate as 需求关闭时间,
(case when closedDate ='0000-00-00 00:00:00' then '未完成' when null then '未完成' else '完成' end) as 需求是否完成,
(select (select name from zt_product where id=zt_module.root) from zt_module where id=zt_story.module) as 所属模块,
(CASE
WHEN closedreason='done'
THEN '已完成'
WHEN closedreason='duplicate'
THEN '重复'
WHEN closedreason='cancel'
THEN '取消'
WHEN closedreason='bydesign'
THEN '设计如此'
WHEN closedreason='willnotdo'
THEN '不做'
WHEN closedreason='postponed'
THEN '延期'
ELSE '未关闭'
END
) AS 关闭原因,
 (select realname from zt_user where account=zt_story.openedBy) as 需求创建人,
     (select name from zt_project where id=(select project from zt_action where
    zt_action.objecttype='story' and zt_action.objectid=zt_story.id and zt_action.action='linked2project' order by date desc  limit 1)) as 所属项目,
    (select name from zt_branch where product =zt_story.product and id=zt_story.branch) as 所属分支,
     (CASE WHEN deleted = 1 THEN '正常' ELSE '已删除' END) as 是否删除
    from zt_story
    where openeddate >'2016-11-30'`,
        '需求列表': `select id as 需求编号,
    (select name from zt_product where id=zt_story.product) as 所属产品,
    (select name from zt_project where id=(select project from zt_action where
    zt_action.objecttype='story' and zt_action.objectid=zt_story.id and zt_action.action='linked2project' order by date desc  limit 1)) as 所属项目,
    (select name from zt_branch where product =zt_story.product and id=zt_story.branch) as 所属分支,
    title as 需求名称,
    openedDate as 需求创建时间
    from zt_story`,
        'bug列表': `select id as bug编号,
     (select name from zt_product where id=zt_bug.product) as 所属产品 ,
     (select name from zt_project where id=zt_bug.project) as 所属省份 ,
     title as bug名称,
     (select realname from zt_user where account=zt_bug.resolvedBy)   as 处理人,
     source
     from zt_bug`,
        'bug详细列表': `select id as 问题编号,
     (select name from zt_product where id=zt_bug.product) as 所属产品 ,
     (CASE
WHEN status='active'
THEN '激活'
WHEN status='resolved'
THEN '解决'
WHEN status='closed'
THEN '已关闭'
ELSE '未知'
END
) AS 状态,
     (select (select name from zt_product where id=zt_module.root) from zt_module where id=zt_bug.module) as 所属模块,
     (select name from zt_branch where product =zt_bug.product and id=zt_bug.branch) as 所属分支,
     (select name from zt_project where id=zt_bug.project) as 所属省份 ,
     title as bug名称,
     type as bug类型,
     source as bug来源,
     (select realname from zt_user where account=zt_bug.rdresponser)   as 研发责任人,
     (select realname from zt_user where account=zt_bug.testresponser)   as 测试责任人,
     (select realname from zt_user where account=zt_bug.reqresponser)   as 需求责任人,
     (select realname from zt_user where account=zt_bug.openedBy)   as 创建人,
     openedDate as 创建时间,
     (SELECT (select realname from zt_user where account=zt_action.actor) FROM zt_action where objectid =zt_bug.id and action = 'bugconfirmed' limit 1)   as 确认人,
     (SELECT date FROM zt_action where objectid =zt_bug.id and action = 'bugconfirmed' limit 1)   as 确认时间,
     confirmed as 是否确认,
     (select realname from zt_user where account=zt_bug.resolvedBy)   as 解决人,
     resolvedDate as 解决时间,
     closedDate as 关闭时间,
     deleted as 是否删除
     from zt_bug where openedDate > '2016-12-25' and deleted = '0'`,
        '人员': 'select * from  bi_report_amb_accountbymonth'
    },
    db2: {
        '报工报表': `select a.work_date as 报工时间,
        b.username as 报工人,
        a.TASK_ID AS 任务编号,
        a.work_time as 报工时长,
        '任务' AS 报工类型
         from dw_worklog a, dw_user b where a.task_type=2 and a.work_date >'2016-12-25' and b.id=a.user_id and b.dep_id = 'zh'
        union all
        select a.work_date as 报工时间,
        b.username as 报工人,
        a.TASK_ID AS 任务编号,
        a.work_time as 报工时长,
        '需求' AS 报工类型
         from dw_worklog a, dw_user b where a.task_type=1 and a.work_date >'2016-12-25' and b.id=a.user_id and b.dep_id = 'zh'
        union all
        select a.work_date as 报工时间,
        b.username as 报工人,
        a.TASK_ID AS 任务编号,
        a.work_time as 报工时长,
        'BUG' AS 报工类型
         from dw_worklog a, dw_user b where a.task_type=3 and a.work_date >'2016-12-25' and b.id=a.user_id and b.dep_id = 'zh' 
        union all
        select a.work_date as 报工时间,
        b.username as 报工人,
        a.TASK_ID AS 任务编号,
        a.work_time as 报工时长,
        'BUG2' AS 报工类型
         from dw_worklog a, dw_user b where a.task_type=21 and a.work_date >'2016-12-25' and b.id=a.user_id and b.dep_id = 'zh' `,
        'bug2列表': `select sheet_id as bug编号,
     province_name as 所属省份 ,
     title as bug名称, 
     'province' as source 
     from it_task2zt where task_type = 21  `

    }
};
module.exports = SQLConfig;
