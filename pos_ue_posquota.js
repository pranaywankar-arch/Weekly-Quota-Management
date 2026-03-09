/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Author Siddharth Jain
 */
define(['N/search','N/currentRecord','N/record'], function (search,cr,record) {

    function beforeLoad(context){
     if(context.type === context.UserEventType.VIEW){
      
        var posQuotaRecord = context.newRecord
        var reference = posQuotaRecord.getValue("id")
        var actualAmount = null;
        var customrecord_quota_non_finSearchObj = search.create({
          type: "customrecord_quota_non_fin",
          filters:
          [
             ["custrecord_reference.custrecord_reference","anyof",reference]
          ],
          columns:
          [
             search.createColumn({
                name: "custrecord_jg_quota_amount_actual",
                join: "CUSTRECORD_REFERENCE",
                summary: "SUM",
                sort: search.Sort.ASC,
                label: "Amount Actual"
             })
          ]
       });
       var searchResultCount = customrecord_quota_non_finSearchObj.runPaged().count;
       log.debug("customrecord_quota_non_finSearchObj result count",searchResultCount);
       customrecord_quota_non_finSearchObj.run().each(function(result){
          // .run().each has a limit of 4,000 results
            actualAmount = result.getValue({
                name: "custrecord_jg_quota_amount_actual",
                join: "CUSTRECORD_REFERENCE",
                summary: "SUM",
                sort: search.Sort.ASC,
                label: "Amount Actual"
            }) 
            log.debug("actual amount",actualAmount)
          return true;
        });
           
        record.submitFields({
            type: "customrecord_quota_non_fin",
            id: reference,
            values:{custrecord_jg_actual_total : Number(actualAmount)}
        })
     }
    }

    function afterSubmit(context){
        if(context.type === context.UserEventType.EDIT || context.type === context.UserEventType.CREATE){
            
            var posQuotaRecord = context.newRecord
            var reference = posQuotaRecord.getValue("id")
            var actualAmount = null;
            var customrecord_quota_non_finSearchObj = search.create({
                type: "customrecord_quota_non_fin",
                filters:
                [
                    ["custrecord_reference.custrecord_reference","anyof",reference]
                ],
                columns:
                [
                    search.createColumn({
                        name: "custrecord_jg_quota_amount_actual",
                        join: "CUSTRECORD_REFERENCE",
                        summary: "SUM",
                        sort: search.Sort.ASC,
                        label: "Amount Actual"
                    })
                ]
            });
            var searchResultCount = customrecord_quota_non_finSearchObj.runPaged().count;
            log.debug("customrecord_quota_non_finSearchObj result count",searchResultCount);
            customrecord_quota_non_finSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                    actualAmount = result.getValue({
                        name: "custrecord_jg_quota_amount_actual",
                        join: "CUSTRECORD_REFERENCE",
                        summary: "SUM",
                        sort: search.Sort.ASC,
                        label: "Amount Actual"
                    }) 
                    log.debug("actual amount",actualAmount)
                return true;
                });
                
            record.submitFields({
                type: "customrecord_quota_non_fin",
                id: reference,
                values:{custrecord_jg_actual_total : Number(actualAmount)}
            })

        }
    }

    return{
        beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }

});