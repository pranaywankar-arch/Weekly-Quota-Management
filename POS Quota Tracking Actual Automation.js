/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript


 Date                                Author                                      Description
 6 Nov 2024                         Sachin                                       P1X-497 - 50 50 split calculation
 */



define(['N/search', 'N/record', 'N/format'],
    function(search, record, format) {



        function getInputData() {


            return search.create({
                type: "customrecord_quot_det_nonfin",
                filters: [

                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    }),
                    search.createColumn({
                        name: "custrecord_rep_name",
                        join: "CUSTRECORD_REFERENCE",
                        label: "Rep Name"
                    })
                ]
            });


        }


        function map(context) {

            try {

                // log.debug("context", JSON.stringify(context))
                var transactionSearchObj = JSON.parse(context.value);
                //log.debug("transactionSearchObj", JSON.stringify(transactionSearchObj))


                var id = transactionSearchObj.values.internalid.value;
                var repId = transactionSearchObj.values['custrecord_rep_name.CUSTRECORD_REFERENCE'].value;

                var amountActual = 0;
                var emailActual = 0;
                var visitActual = 0;
                var surveyActual = 0;
                var phoneCallActual = 0;
                var leadActual = 0;
                var proposalActual = 0;

                var quotaRec = record.load({
                    type: 'customrecord_quot_det_nonfin',
                    id: id,
                    isDynamic: true
                });


                var startDate = quotaRec.getText('custrecord_jg_week_start_date');
                var endDate = quotaRec.getText('custrecord_jg_wee_end_date');

                var startDt = startDate;
                var endDt = endDate;

                startDate = startDate + ' 12:00 am';
                endDate = endDate + ' 11:59 pm';

                log.debug('startDate', startDate);
                log.debug('endDate', endDate);

                log.debug('startDt', startDt);
                log.debug('endDt', endDt);


                var transactionSearchObj = search.create({
                    type: "transaction",
                    settings: [{
                        "name": "consolidationtype",
                        "value": "ACCTTYPE"
                    }],
                    filters:[
                        ["type", "anyof", "Estimate"],
                        "AND",
                        ["custbody_jg_closed_won_date_time", "within", startDate, endDate],
                        "AND",
                        ["class", "noneof", "4"],
                        "AND",
                        ["location", "noneof", "43"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["entitystatus", "anyof", "13"],
                        "AND",
                        [[["salesrep", "anyof", repId]], "OR", [["custbody_jg_opp_lead_creator_giver", "anyof", repId]], "AND", [["custbody_jg_opp_split_type_code", "anyof", "3"]]]
                    ],
                    columns: [
                        search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end",
                            label: "Formula (Currency)"
                        }),
                       search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({fxamount}/2) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                            label: "Split Amount"
                        }),
						
						 search.createColumn({
                            name: "formulacurrency",
                            summary: "SUM",
                            formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({custrecord_jg_link.custrecord_jg_contribution_percentage}*{fxamount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                            label: "Actual Sales"
                        })
                    ]
                });

                transactionSearchObj.run().each(function(result) {
                  
                   /* var amt = result.getValue({
                        name: "formulacurrency",
                        summary: "SUM",
						formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({fxamount}/2) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                        label: "Split Amount"
                    }); */

                   var amt = result.getValue({
                        name: "formulacurrency",
                        summary: "SUM",
						formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({custrecord_jg_link.custrecord_jg_contribution_percentage}*{fxamount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                        label: "Actual Sales"
                    });
                    if (amt) {
                        amountActual = amt;
                    }

                    return true;
                });

                quotaRec.setValue({
                    fieldId: 'custrecord_jg_quota_amount_actual',
                    value: amountActual
                });

                /*    var fieldLookUp = search.lookupFields({
                   type: search.Type.EMPLOYEE,
                   id: repId,
                   columns: ['email']
                });
    
                var repEmail = fieldLookUp.email;
                log.debug('repEmail', repEmail);		*/

                var customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["messages.author", "anyof", repId],
                        "AND",
                        ["messages.messagedate", "onorafter", startDate.toString()],
                        "AND",
                        ["messages.messagedate", "onorbefore", endDate.toString()]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            join: "messages",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);

                if (searchResultCount) {
                    emailActual = searchResultCount;
                }

                quotaRec.setValue({
                    fieldId: 'custrecord_email_actuals',
                    value: emailActual
                });


                var fieldeventSearchObj = search.create({
                    type: "calendarevent",
                    filters: [
                        ["custevent_jp_sales_event_type", "anyof", "1"],
                        "AND",
                        ["status", "anyof", "COMPLETE"],
                        "AND",
                        // ["transaction.type", "anyof", "Estimate", "Opprtnty"],
                        //"AND",
                        ["organizer", "anyof", repId],
                        "AND",
                        ["completeddate", "within", startDt, endDt]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            summary: "COUNT",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount2 = fieldeventSearchObj.runPaged().count;
                log.debug("fieldeventSearchObj result count", searchResultCount2);
                fieldeventSearchObj.run().each(function(result) {

                    var visit = result.getValue({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    });

                    if (visit) {
                        visitActual = visit;
                    }

                    return true;

                });


                log.debug('visitActual', visitActual);

                quotaRec.setValue({
                    fieldId: 'custrecord_visit_actuals',
                    value: visitActual
                });


                var surveyeventSearchObj = search.create({
                    type: "calendarevent",
                    filters: [
                        [["custevent_jp_sales_event_type","anyof","2"],"OR",["custevent_service_survey","is","T"]],
                        "AND",
                        ["status", "anyof", "COMPLETE"],
                        "AND",
                        //["transaction.type", "anyof", "Estimate", "Opprtnty"],
                        //"AND",
                        ["organizer", "anyof", repId],
                        "AND",
                        ["completeddate", "within", startDt, endDt]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            summary: "COUNT",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount3 = surveyeventSearchObj.runPaged().count;
                log.debug("surveyeventSearchObj result count", searchResultCount3);
                surveyeventSearchObj.run().each(function(result) {

                    var survey = result.getValue({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    });

                    if (survey) {
                        surveyActual = survey;
                    }

                    return true;
                });

                log.debug('surveyActual', surveyActual);

                quotaRec.setValue({
                    fieldId: 'custrecord_service_surveys_actuals',
                    value: surveyActual
                });



                var phonecallSearchObj = search.create({
                    type: "phonecall",
                    filters: [
                        ["assigned", "anyof", repId],
                        "AND",
                        ["status", "anyof", "COMPLETE"],
                        "AND",
                        ["completeddate", "within", startDt, endDt]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            summary: "COUNT",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount4 = phonecallSearchObj.runPaged().count;
                log.debug("phonecallSearchObj result count", searchResultCount4);
                phonecallSearchObj.run().each(function(result) {

                    var phoneCall = result.getValue({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    });

                    if (phoneCall) {
                        phoneCallActual = phoneCall;
                    }

                    return true;
                });

                log.debug('phoneCallActual', phoneCallActual);

                quotaRec.setValue({
                    fieldId: 'custrecord_phone_calls_actauls',
                    value: phoneCallActual
                });


                var customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["stage", "anyof", "LEAD", "PROSPECT"],
                        "AND",
                        ["salesrep", "anyof", repId],
                        "AND",
                        ["datecreated", "within", startDt, endDt], 
						"AND", 
						["systemnotes.context","anyof","RST","SLT","RWS","UIF","WST","WSS"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            summary: "COUNT",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount5 = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount5);
                customerSearchObj.run().each(function(result) {

                    var lead = result.getValue({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    });

                    if (lead) {
                        leadActual = lead;
                    }

                    return true;

                });

                log.debug('leadActual', leadActual);

                quotaRec.setValue({
                    fieldId: 'custrecord_new_prospects_actauls',
                    value: leadActual
                });

                var estimateSearchObj = search.create({
                    type: "estimate",
                    filters: [
                        ["type", "anyof", "Estimate"],
                        "AND",
                        ["salesrep", "anyof", repId],
                        "AND",
                        ["datecreated", "within", startDt, endDt], 
						"AND", 
						["systemnotes.context","noneof","CSV"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            summary: "COUNT",
                            label: "Internal ID"
                        })
                    ]
                });
                var searchResultCount6 = estimateSearchObj.runPaged().count;
                log.debug("estimateSearchObj result count", searchResultCount6);
                estimateSearchObj.run().each(function(result) {

                    var proposal = result.getValue({
                        name: "internalid",
                        summary: "COUNT",
                        label: "Internal ID"
                    });

                    if (proposal) {
                        proposalActual = proposal;
                    }

                    return true;

                });

                log.debug('proposalActual', proposalActual);

                quotaRec.setValue({
                    fieldId: 'custrecord_proposals_actauls',
                    value: proposalActual
                });

                quotaRec.save();

            } catch (ex) {

                log.debug('ex', ex);

            }

        }

        /* function getFormattedDate(date) {
           var year = date.getFullYear();
 
           var month = (1 + date.getMonth()).toString();
           month = month.length > 1 ? month : '0' + month;
 
           var day = date.getDate().toString();
           day = day.length > 1 ? day : '0' + day;
 
           return month + '/' + day + '/' + year;
       } */



        return {
            getInputData: getInputData,
            map: map
        };
    });