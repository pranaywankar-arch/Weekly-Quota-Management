/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 *P1X-734 Updated WPM script Actual Amount formula with New adding commssion Status.
 */
define(['N/record', 'N/search', 'N/format', 'N/render', 'N/xml'],
    /**
     * @param{record} record
     * @param{search} search
     */
    (record, search, format, render, xml) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

            if (scriptContext.type == 'delete') {
                return;
            }
            log.debug('Before Submit')
            var recObj = scriptContext.newRecord;
            var weekStartDate = recObj.getValue('custrecord_wpm_week_sd');
            log.debug('Week Start Date:', weekStartDate);

            var weekendDate = recObj.getValue('custrecord_wpm_week_ed');
            log.debug('Week End Date:', weekendDate);

            if (!weekStartDate || !weekendDate) {
                // add current week date
                var currentDate = new Date();
                var startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - currentDate.getDay());
                var endDate = new Date(currentDate);
                log.debug('Week Start and End Date', startDate + '@@@@' + endDate);
                endDate.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
                recObj.setValue('custrecord_wpm_week_sd', startDate)
                recObj.setValue('custrecord_wpm_week_ed', endDate)



            }
            setPrevMonthStartandEndDate(recObj)
            var weekSd = recObj.getValue('custrecord_wpm_week_sd');
            log.debug('Week Sd:', weekSd);

            var weeked = recObj.getValue('custrecord_wpm_week_ed');
            log.debug('week ed', weeked);

            var dateFormat = format.Type.DATE;
            var startDateString = format.format({
                value: weekSd,
                type: dateFormat
            })

            var endDateString = format.format({
                value: weeked,
                type: dateFormat
            })

            var salesRep = recObj.getValue('custrecord_wpm_sales_rep')
            var posQuotaObj = getQuota(salesRep, startDateString, endDateString)
            recObj.setValue('custrecord_wpm_pos_quote_details', posQuotaObj.posQuotaId)


        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {


            if (scriptContext.type == 'delete') {
                return;
            }
            var recObj = record.load({
                type: scriptContext.newRecord.type,
                id: scriptContext.newRecord.id,
            })


            var posQuota = recObj.getValue('custrecord_wpm_pos_quote_details');
            if (!posQuota) {
                recObj.setValue('custrecord_wpm_err', "POS Quota record not found");
                recObj.save();
                return;

            }
            var dateFormat = format.Type.DATE;
            var salesRep = recObj.getValue('custrecord_wpm_sales_rep');

            var empDetails = search.lookupFields({
                type: 'employee',
                id: salesRep,
                columns: ['custentity_jg_employee_start_date', 'custentity_pos_crm_start_date', 'custentity_jg_employee_sales_territory']
                //columns : ['custentity_jg_employee_start_date','custentity_jg_employee_sales_territory']
            });

            var empstartDate;
            var empstartD = empDetails.custentity_jg_employee_start_date;
            log.debug('Start Date:',empstartD);

            var empCrmDate = empDetails.custentity_pos_crm_start_date;
            log.debug('empCrmDate',empCrmDate);

            log.debug('Hi');
            if (empCrmDate) {
                log.debug('Hi 2');
                 empstartDate = empDetails.custentity_pos_crm_start_date;
                log.debug('Employee CRM Start Date:',empstartDate);
            }
            else if(empstartD){
                log.debug('hi 3');
                 empstartDate = empDetails.custentity_jg_employee_start_date;
                 log.debug('Employee Start date', empstartDate);
            }
            

            var salesTerritory = '00';
            if (empDetails.custentity_jg_employee_sales_territory.length > 0) {
                salesTerritory = empDetails.custentity_jg_employee_sales_territory[0].text;
            }
            empstartDate = format.parse({
                value: empstartDate,
                type: dateFormat
            })
            log.debug('empstartDate',empstartDate);




            var empEndDate = recObj.getValue('custrecord_wpm_week_ed');
            empEndDate = format.parse({
                value: empEndDate,
                type: dateFormat
            })

            var fiscalyrSd = recObj.getValue('custrecord_wpm_fiscal_yr_sd');
            fiscalyrSd = format.parse({
                value: fiscalyrSd,
                type: dateFormat
            })

            if (empstartDate < fiscalyrSd) {
                empstartDate = fiscalyrSd;
            }

            log.debug('fiscalyrSd', fiscalyrSd)
            log.debug('emp start date and end date', empstartDate + '&&' + empEndDate)
            var totalWeeks = parseInt(calculateWeeksBetween(empstartDate, empEndDate));
            log.debug('Total Weeks:', totalWeeks);

            recObj.setValue('custrecord_wpm_report_field_week', totalWeeks);
            var salesRepText = recObj.getText('custrecord_wpm_sales_rep');
            var weekSd = recObj.getValue('custrecord_wpm_week_sd');
            var weeked = recObj.getValue('custrecord_wpm_week_ed');

            var CurrfirstDay = new Date(weekSd.getFullYear(), weekSd.getMonth(), 1);
            var CurrlastDay = new Date(weekSd.getFullYear(), weekSd.getMonth() + 1, 0);
            log.audit('CurrfirstDay', CurrfirstDay + '#####' + CurrlastDay)
            var weekNo = Number(recObj.getValue('custrecord_wpm_week_no'));


            CurrfirstDay = format.format({
                value: CurrfirstDay,
                type: dateFormat
            })

            CurrlastDay = format.format({
                value: CurrlastDay,
                type: dateFormat
            })
            var startDateString = format.format({
                value: weekSd,
                type: dateFormat
            })


            var endDateString = format.format({
                value: weeked,
                type: dateFormat
            })

            weeked = format.parse({
                value: weeked,
                type: format.Type.DATE
            })


            var day = weeked.getDate();
            var getMonth = weeked.getMonth();
            var year = weeked.getFullYear();
            var dateObj = new Date(year, getMonth, day)
            var nextWeek = dateObj.setDate(weeked.getDate() + 7);
            log.audit('date no', day);
            log.audit('date Obj', dateObj);
            log.debug('next week date obj', nextWeek)
            var nextWeekDateStr = format.format({
                value: dateObj,
                type: dateFormat
            })

            log.debug('nextWeekDateStr', nextWeekDateStr)


            var pmSd = recObj.getValue('custrecord_prio_month_date');
            var pmed = recObj.getValue('custrecord_wpm_prior_mth_end_date');
            var dateFormat = format.Type.DATE;
            var pmStartDateStr = format.format({
                value: pmSd,
                type: dateFormat
            })

            var posQuotaObj = getQuota(salesRep, startDateString, endDateString)
            recObj.setValue('custrecord_wpm_pos_quote_details', posQuotaObj.posQuotaId)
            recObj.setValue('custrecord_wpm_week', posQuotaObj.weekTotal)
            var pmEndDateStr = format.format({
                value: pmed,
                type: dateFormat
            })


            var ytdSd = recObj.getValue('custrecord_wpm_fiscal_yr_sd');
            var ytdEd = recObj.getValue('custrecord_wpm_fiscal_year_ed');
            var dateFormat = format.Type.DATE;
            if (ytdSd && ytdEd) {
                var ytdDateStr = format.format({
                    value: ytdSd,
                    type: dateFormat
                })
                log.debug('Fiscal Year Start Date:', ytdDateStr);

                var ytdEndDateStr = format.format({
                    value: ytdEd,
                    type: dateFormat
                })
                log.debug('Fiscal year End date:', ytdEndDateStr);
            }




            var soldAccCurrMoObj = getAccountsMonth(salesRep, true, CurrfirstDay, CurrlastDay);
            if (soldAccCurrMoObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_sold_accounts_month', soldAccCurrMoObj.quotes);
                recObj.setValue('custrecord_wpm_sold_month_total', Number(soldAccCurrMoObj.totalAmount));
                recObj.setValue('custrecordwpm_trdm', Number(soldAccCurrMoObj.totalAmount));
                recObj.setValue('custrecord_wpm_sol_acc_mo_count', Number(soldAccCurrMoObj.quotes.length));
            }

            var solAccPrmObj = getAccountsPriorMonth(salesRep, true);
            if (solAccPrmObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_sa_pm', solAccPrmObj.quotes)
                recObj.setValue('custrecord_wpm_so_pm_total', Number(solAccPrmObj.totalAmount));
                recObj.setValue('custrecordwpm_trdpm', Number(solAccPrmObj.totalAmount));
                recObj.setValue('custrecord_wpm_so_pm_count', Number(solAccPrmObj.quotes.length));
            }

            var solAccCurrWeekObj = getAccountsCurrentWeek(salesRep, startDateString, endDateString, true);
            log.debug('solAccCurrWeekObj', solAccCurrWeekObj)
            if (solAccCurrWeekObj.quotes.length >= 0) {
                recObj.setValue('custrecord_sold_accounts_week', solAccCurrWeekObj.quotes);
                recObj.setValue('custrecord_wpm_so_we_total', Number(solAccCurrWeekObj.totalAmount));
                recObj.setValue('custrecord_wpm_trdw', Number(solAccCurrWeekObj.totalAmount));

                recObj.setValue('custrecord_wpm_so_acc_week_count', Number(solAccCurrWeekObj.quotes.length));
            }

            var solAccYtdObj = getAccountYtd(salesRep, ytdDateStr, endDateString, true)
            if (solAccYtdObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_sold_acc_ytd', solAccYtdObj.quotes);
                log.debug('Sold Account YTD Total Amount', Number(solAccYtdObj.totalAmount));
                recObj.setValue('custrecord_wpm_so_ytd_total', Number(solAccYtdObj.totalAmount));
                recObj.setValue('custrecordwpm_trd_ytd', Number(solAccYtdObj.totalAmount));
                recObj.setValue('custrecord_wpm_sold_ytd_count', Number(solAccYtdObj.quotes.length));
            }

            var proMadeCurrWeekObj = getAccountsCurrentWeek(salesRep, startDateString, endDateString, false);
            var proMadeMonObj = getAccountsMonth(salesRep, false, CurrfirstDay, CurrlastDay);
            var proPrMonObj = getAccountsPriorMonth(salesRep, false);
            var prMadeYtd = getAccountYtd(salesRep, ytdDateStr, endDateString, false);
            log.debug('prMadeYtd', prMadeYtd)
            if (prMadeYtd.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_pm_ytd', prMadeYtd.quotes);
                log.debug('Proposals YTD Total Amount:', Number(prMadeYtd.totalAmount));
                recObj.setValue('custrecord_wpm_pm_ytd_total', Number(prMadeYtd.totalAmount));
                ///recObj.setValue('custrecord_wpm_pm_ytd_total',prMadeYtd.totalAmount);
                recObj.setValue('custrecord_wpm_proposal_ytd_count', Number(prMadeYtd.quotes.length));

            }

            if (proMadeCurrWeekObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_pmade_week', proMadeCurrWeekObj.quotes);
                recObj.setValue('custrecord_wpm_pr_week_total', Number(proMadeCurrWeekObj.totalAmount));
                recObj.setValue('custrecord_wpm_pm_wee_count', Number(proMadeCurrWeekObj.quotes.length));
            }

            if (proMadeMonObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_proposals_month', proMadeMonObj.quotes);
                recObj.setValue('custrecord_wpm_proposal_made_mon_total', Number(proMadeMonObj.totalAmount));
                recObj.setValue('custrecord_wpm_pm_no_count', Number(proMadeMonObj.quotes.length));
            }

            if (proPrMonObj.quotes.length >= 0) {
                recObj.setValue('custrecord_wpm_pm_pm', proPrMonObj.quotes);
                recObj.setValue('custrecord_wpm_pm_prm_total', Number(proPrMonObj.totalAmount));
                recObj.setValue('custrecord_wpm_pm_prm_count', Number(proPrMonObj.quotes.length));
            }



            var posQuotaObj = record.load({ type: 'customrecord_quot_det_nonfin', id: posQuota })

            recObj.setValue('custrecord_wpm_email_sent_week_perc', calculatePercent(posQuotaObj.getValue('custrecord_email_actuals'), posQuotaObj.getValue('custrecord_email_quota')))
            recObj.setValue('custrecord_wpm_phone_cont_week_pr', calculatePercent(posQuotaObj.getValue('custrecord_phone_calls_actauls'), posQuotaObj.getValue('custrecord_phone_calls')))
            recObj.setValue('custrecord_wpm_fiel_vists_week_pr', calculatePercent(posQuotaObj.getValue('custrecord_visit_actuals'), posQuotaObj.getValue('custrecord_field_visits')))
            recObj.setValue('custrecord_wpm_proposal_week_pr', calculatePercent(posQuotaObj.getValue('custrecord_proposals_actauls'), posQuotaObj.getValue('custrecord_proposals')))
            recObj.setValue('custrecord_wpm_ser_sur_week_pr', calculatePercent(posQuotaObj.getValue('custrecord_service_surveys_actuals'), posQuotaObj.getValue('custrecord_service_surveys')))
            recObj.setValue('custrecord_wpm_new_pros_week_pr', calculatePercent(posQuotaObj.getValue('custrecord_new_prospects_actauls'), posQuotaObj.getValue('custrecord_new_prospects')))

            recObj.setValue('custrecord_wpm_sales_pl_wee_perc', calculatePercent(posQuotaObj.getValue('custrecord_jg_quota_amount_actual'), posQuotaObj.getValue('custrecord_amount')))


            // ===================== CLOSE % ================================//

            var proposalMadeCount = Number(recObj.getValue('custrecord_wpm_pm_wee_count'));
            var soldAccCountWeek = Number(recObj.getValue('custrecord_wpm_so_acc_week_count'));
            recObj.setValue('custrecord_wpm_close_week', calculatePercent(soldAccCountWeek, proposalMadeCount));


            var proposalMadeMoCount = Number(recObj.getValue('custrecord_wpm_pm_no_count'));
            var soldAccCountMoTotal = Number(recObj.getValue('custrecord_wpm_sol_acc_mo_count'));
            recObj.setValue('custrecord_wpm_close_month', calculatePercent(soldAccCountMoTotal, proposalMadeMoCount));


            var proposalMadePrCount = Number(recObj.getValue('custrecord_wpm_pm_prm_count'));
            var soldAccCountPrTotal = Number(recObj.getValue('custrecord_wpm_so_pm_count'));
            recObj.setValue('custrecordwpm_close_pr_month', calculatePercent(soldAccCountPrTotal, proposalMadePrCount));


            var proposalMadeYtdCount = Number(recObj.getValue('custrecord_wpm_proposal_ytd_count'));
            var soldAccCountYtdTotal = Number(recObj.getValue('custrecord_wpm_sold_ytd_count'));
            recObj.setValue('custrecord_wpm_close_perc_ytd', calculatePercent(soldAccCountYtdTotal, proposalMadeYtdCount));

            var totalWeekProposal = Number(recObj.getValue('custrecord_wpm_pr_week_total'));
            recObj.setValue('custrecord_close_pr_weekl_ytd_avg', calculateAvg(totalWeekProposal, weekNo));




            // ==================================================================//



            //===================== Avg Rental Sales Revenue by Acct====================//

            var solAccWeekCount = Number(recObj.getValue('custrecord_wpm_so_acc_week_count'));
            var solAccWeekTotal = Number(recObj.getValue('custrecord_wpm_so_we_total'));
            recObj.setValue('custrecord_wpm_arsr_week', calculateAvg(solAccWeekTotal, solAccWeekCount));

            var solAccMoCount = Number(recObj.getValue('custrecord_wpm_sol_acc_mo_count'));
            var solAccMoTotal = Number(recObj.getValue('custrecord_wpm_sold_month_total'));
            recObj.setValue('custrecord_wpm_arsr_month', calculateAvg(solAccMoTotal, solAccMoCount));


            var solAccPrCount = Number(recObj.getValue('custrecord_wpm_so_pm_count'));
            var solAccPrTotal = Number(recObj.getValue('custrecord_wpm_so_pm_total'));
            recObj.setValue('custrecord_wpm_arsr_prior_month', calculateAvg(solAccPrTotal, solAccPrCount));


            var solAccYtdCount = Number(recObj.getValue('custrecord_wpm_sold_ytd_count'));
            var solAccYtdTotal = Number(recObj.getValue('custrecord_wpm_so_ytd_total'));
            recObj.setValue('custrecord_wpm_arsr_ytd', calculateAvg(solAccYtdTotal, solAccYtdCount));


            recObj.setValue('custrecord_wpm_arsr_ytd_avg', calculateAvg(solAccYtdTotal, weekNo));

            //=============================================================================//

            var pmObj = {
                custrecord_jg_quota_amount_actual: 0,
                custrecord_email_quota: 0,
                custrecord_email_actuals: 0,
                custrecord_field_visits: 0,
                custrecord_visit_actuals: 0,
                custrecord_phone_calls: 0,
                custrecord_phone_calls_actauls: 0,
                custrecord_new_prospects_actauls: 0,
                custrecord_new_prospects: 0,
                custrecord_service_surveys: 0,
                custrecord_service_surveys_actuals: 0,
                custrecord_proposals: 0,
                custrecord_proposals_actauls: 0,
                custrecord_jg_mtd: 0,
                custrecord_amount: 0,
                salesPlan: 0

            }
            var pmDetailObj = getPosQuotedetails(pmStartDateStr, pmEndDateStr, salesRep)
            recObj.setValue('custrecord_wpm_prio_monts_quota', pmDetailObj.recIds)
            recObj.setValue('custrecord_wpm_emails_sent_pm', calculatePercent(pmDetailObj.posDeObj.custrecord_email_actuals, pmDetailObj.posDeObj.custrecord_email_quota))
            recObj.setValue('custrecord_wpm_ph_conts_pm', calculatePercent(pmDetailObj.posDeObj.custrecord_phone_calls_actauls, pmDetailObj.posDeObj.custrecord_phone_calls))
            recObj.setValue('custrecord_wpm_field_visits_month', calculatePercent(pmDetailObj.posDeObj.custrecord_visit_actuals, pmDetailObj.posDeObj.custrecord_field_visits))
            recObj.setValue('custrecord_wpm_prop_prio_mont', calculatePercent(pmDetailObj.posDeObj.custrecord_proposals_actauls, pmDetailObj.posDeObj.custrecord_proposals))
            recObj.setValue('custrecordwpm_ser_sur_pm', calculatePercent(pmDetailObj.posDeObj.custrecord_service_surveys_actuals, pmDetailObj.posDeObj.custrecord_service_surveys))
            recObj.setValue('custrecord_wpm_props_prior_month', calculatePercent(pmDetailObj.posDeObj.custrecord_new_prospects_actauls, pmDetailObj.posDeObj.custrecord_new_prospects))
            recObj.setValue('custrecord_wpm_sale_plan_pm', calculatePercent(pmDetailObj.posDeObj.custrecord_jg_quota_amount_actual, pmDetailObj.posDeObj.custrecord_amount))

            var ytdObj = getPosQuotedetails(ytdDateStr, endDateString, salesRep);


            recObj.setValue('custrecord_wpm_email_sent_ytd', calculatePercent(ytdObj.posDeObj.custrecord_email_actuals, ytdObj.posDeObj.custrecord_email_quota))
            recObj.setValue('custrecord_wpm_ph_cont_ytd', calculatePercent(ytdObj.posDeObj.custrecord_phone_calls_actauls, ytdObj.posDeObj.custrecord_phone_calls))
            recObj.setValue('custrecord_wpm_field_visi_ytd', calculatePercent(ytdObj.posDeObj.custrecord_visit_actuals, ytdObj.posDeObj.custrecord_field_visits))
            recObj.setValue('custrecord_wpm_proposal_ytd', calculatePercent(ytdObj.posDeObj.custrecord_proposals_actauls, ytdObj.posDeObj.custrecord_proposals))
            recObj.setValue('custrecord_wpm_ser_sur_ytd', calculatePercent(ytdObj.posDeObj.custrecord_service_surveys_actuals, ytdObj.posDeObj.custrecord_service_surveys))
            recObj.setValue('custrecord_wpm_new_pro_ytd', calculatePercent(ytdObj.posDeObj.custrecord_new_prospects_actauls, ytdObj.posDeObj.custrecord_new_prospects))
            recObj.setValue('custrecordwpm_ytd_plan', ytdObj.posDeObj.custrecord_amount)
            var totalAmount = Number(recObj.getValue('custrecordwpm_trd_ytd'));
            var planTotalAmt = Number(recObj.getValue('custrecordwpm_ytd_plan'));
            recObj.setValue('custrecord_wpm_sal_pln_ttd', calculatePercent(totalAmount, planTotalAmt))


            var mtdObj = getPosQuotedetails(CurrfirstDay, endDateString, salesRep);

            // var objMtd = getPosQuotedetails(CurrfirstDay, endDateString, salesRep);


            recObj.setValue('custrecord_wpm_email_sent_mtd', calculatePercent(mtdObj.posDeObj.custrecord_email_actuals, mtdObj.posDeObj.custrecord_email_actuals));
            recObj.setValue('custrecord_wpm_phone_contacts_mtd', calculatePercent(mtdObj.posDeObj.custrecord_phone_calls_actauls, mtdObj.posDeObj.custrecord_phone_calls));
            recObj.setValue('custrecord_wpm_fieldvisit_mtd', calculatePercent(mtdObj.posDeObj.custrecord_visit_actuals, mtdObj.posDeObj.custrecord_field_visits));
            recObj.setValue('custrecord_wpm_proposal_mtd', calculatePercent(mtdObj.posDeObj.custrecord_proposals_actauls, mtdObj.posDeObj.custrecord_proposals));
            recObj.setValue('custrecord_wpm_service_sur_mtd', calculatePercent(mtdObj.posDeObj.custrecord_service_surveys_actuals, mtdObj.posDeObj.custrecord_service_surveys));
            recObj.setValue('custrecord_wpm_new_pross_mtd', calculatePercent(mtdObj.posDeObj.custrecord_new_prospects_actauls, mtdObj.posDeObj.custrecord_new_prospects));
            recObj.setValue('custrecord_wpm_sales_pl_mtd', calculatePercent(mtdObj.posDeObj.custrecord_jg_quota_amount_actual, mtdObj.posDeObj.custrecord_amount));
            //  recObj.setValue('custrecord_wpm_sal_pln_ttd',ytdObj.recIds)

            var allAccountsObj = getAllSoldAccounts(startDateString, endDateString, salesRep)

            recObj.setValue('custrecord_wpm_total_rental_dollars', parseInt(allAccountsObj.totalDollarAmt))


            recObj.setValue('custrecord_wpm_soldacc_week1', JSON.stringify(allAccountsObj.allAccounts));

            var monthToDate = Number(mtdObj.posDeObj.custrecord_email_actuals) + Number(mtdObj.posDeObj.custrecord_phone_calls_actauls) + Number(mtdObj.posDeObj.custrecord_visit_actuals) + Number(mtdObj.posDeObj.custrecord_new_prospects_actauls)
            var yrToDate = Number(ytdObj.posDeObj.custrecord_email_actuals) + Number(ytdObj.posDeObj.custrecord_phone_calls_actauls) + Number(ytdObj.posDeObj.custrecord_visit_actuals) + Number(ytdObj.posDeObj.custrecord_new_prospects_actauls)
            recObj.setValue('custrecord_wpm_month_to_date', monthToDate)
            recObj.setValue('custrecord_wpm_year_to_date', yrToDate)

            var totalRentalYtd = Number(recObj.getValue('custrecordwpm_trd_ytd'));
            var weekNo = Number(recObj.getValue('custrecord_wpm_week_no'));
            recObj.setValue('custrecord_wpm_total_rental_ytd_weeklavg', calculateAvg(totalRentalYtd, weekNo))

            recObj.setValue('custrecord_wpm_year_to_date_weeklyavg', calculateAvg(Number(recObj.getValue('custrecord_wpm_year_to_date')), weekNo))

            recObj.setValue('custrecord_wpm_prop_made_week_avg', calculateAvg(Number(recObj.getValue('custrecord_wpm_proposal_ytd_count')), weekNo))

            recObj.setValue('custrecord_wpm_sol_weekl_avg', calculateAvg(Number(recObj.getValue('custrecord_wpm_sold_ytd_count')), weekNo))

            recObj.save();

            var renderer = render.create();
            renderer.setTemplateByScriptId({
                scriptId: "CUSTTMPL_WPM_REPORT"  //template Id
            });


            var recObj = record.load({
                type: recObj.type,
                id: recObj.id,
                //isDynamic: true
            })

            var wpmReqId = recObj.getValue('custrecord_wpm_req');
            var myContent = renderer.addRecord({
                templateName: 'record',
                record: recObj
            })

            var xmlStr = renderer.renderAsString();
            log.debug('xml str', xmlStr);

            var pdfFile = render.xmlToPdf({
                xmlString: xmlStr
            });
            pdfFile.folder = 111328;
            pdfFile.isOnline = true;
            pdfFile.name = salesTerritory + '_' + wpmReqId + "_" + salesRepText + '_' + recObj.id
            try {

                var id = pdfFile.save()
                log.debug('file Id', id);
                var id = record.attach({
                    record: {
                        type: 'file',
                        id: id
                    },
                    to: {
                        type: recObj.type,
                        id: recObj.id
                    }
                });

            } catch (e) {
                log.error('error-->' + e, recObj.id)
            }


        }


        function setPrevMonthStartandEndDate(recObj) {
            let d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - 1);
            d.setHours(0, 0, 0, 0);
            const lastMonthStart = new Date(d);

            var lastDay = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth() + 1, 0);
            recObj.setValue('custrecord_prio_month_date', lastMonthStart);
            recObj.setValue('custrecord_wpm_prior_mth_end_date', lastDay)

        }


        function getAllSoldAccounts(startDate, endDate, salesRep) {
            var estimateSearchObj = search.create({
                type: "estimate",
                settings: [{
                    "name": "consolidationtype",
                    "value": "ACCTTYPE"
                }],
                filters: [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["entitystatus", "anyof", "13"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "within", startDate, endDate],
                    "AND",
                    ["salesrep", "is", startDate, salesRep],
                    "AND",
                    ["class", "noneof", "4"],
                    "AND",
                    ["entitystatus", "noneof", "14"]
                ],
                columns: [
                    search.createColumn({
                        name: "salesrep",
                        label: "Sales Rep"
                    }),
                    search.createColumn({
                        name: "hiredate",
                        join: "salesRep",
                        label: "Start Date"
                    }),
                    search.createColumn({
                        name: "isinactive",
                        join: "salesRep",
                        label: "Emp Inactive"
                    }),
                    search.createColumn({
                        name: "custbody_jg_closed_won_date_time",
                        label: "Sale Date"
                    }),
                    search.createColumn({
                        name: "tranid",
                        label: "ID#"
                    }),
                    search.createColumn({
                        name: "custcol_2663_companyname",
                        label: "Company Name"
                    }),
                    search.createColumn({
                        name: "custbody_jg_approval_prospect_sic",
                        label: "SIC 1"
                    }),
                   // P1X-734 Changed the formula
				   // Old Formula : "case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then  {custbody_pos_ds_rev_amount} else {fxamount} end"
				   // new Formula : "case when {custbody_jg_opp_split_type_code} ='50-50'  AND {custbody_jg_opp_commission_status} = 'Commissions Paid' then ({custbody_pos_ds_rev_amount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end"
				   search.createColumn({
                        name: "formulacurrency",
                        formula: "case when {custbody_jg_opp_split_type_code} ='50-50'  AND {custbody_jg_opp_commission_status} = 'Commissions Paid' then ({custbody_pos_ds_rev_amount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                        label: "Total Sales $"
                    }),
                    search.createColumn({
                        name: "custbody_jg_incumbent",
                        label: "Competitor"
                    })
                ]
            });

            var results = [];
            var totalAmt = 0;
            estimateSearchObj.run().each(function (result) {
                // P1X-734 Changed the formula
				// "case when {custbody_jg_opp_split_type_code} ='50-50'  AND {custbody_jg_opp_commission_status} = 'Commissions Paid' then ({custbody_pos_ds_rev_amount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end"
                    var dollarAmt = result.getValue({
                    name: "formulacurrency",
                    formula: "case when {custbody_jg_opp_split_type_code} ='50-50'  AND {custbody_jg_opp_commission_status} = 'Commissions Paid' then ({custbody_pos_ds_rev_amount}) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                    label: "Total Sales $"
                })
                results.push({

                    salesRep: escXml(result.getText({
                        name: "salesrep",
                        label: "Sales Rep"
                    })),

                    hireDate: escXml(result.getValue({
                        name: "hiredate",
                        join: "salesRep",
                        label: "Start Date"
                    })),

                    companyName: escXml(result.getValue({
                        name: "custcol_2663_companyname",
                        label: "Company Name"
                    })),
                    Sic: escXml(result.getValue({
                        name: "custbody_jg_approval_prospect_sic",
                        label: "SIC 1"
                    })),
                    dollarAmount: dollarAmt,
                    competitor: escXml(result.getText({
                        name: "custbody_jg_incumbent",
                        label: "Competitor"
                    })),
                    tranid: escXml(result.getValue({
                        name: "tranid",
                        label: "ID#"
                    })),

                    salesDate: escXml(result.getValue('custbody_jg_closed_won_date_time'))



                })

                totalAmt = Number(totalAmt) + Number(dollarAmt)
                return true;
            });

            return { allAccounts: results, totalDollarAmt: totalAmt };
        }



        function escXml(str) {


            if (str) {

                str = str.toString();

                return xml.escape({
                    xmlText: str
                })
            }

            return str;



        }
        function getQuota(salesrepId, startDateString, endDateString) {
            log.debug('star date and end date filter', startDateString + '###' + endDateString)
            var customrecord_quot_det_nonfinSearchObj = search.create({
                type: "customrecord_quot_det_nonfin",
                filters: [
                    ["custrecord_jg_week_start_date", "onorafter", startDateString, startDateString],
                    "AND",
                    ["custrecord_reference.custrecord_rep_name", "anyof", salesrepId],
                    "AND",
                    ["custrecord_jg_wee_end_date", "onorbefore", endDateString],
                    "AND",
                    ["isinactive", "is", 'F'],
                    "AND",
                    ["custrecord_reference.isinactive", "is", 'F'],
                ],
                columns: [
                    search.createColumn({
                        name: "scriptid",
                        sort: search.Sort.ASC,
                        label: "Script ID"
                    }),
                    search.createColumn({
                        name: "custrecord_reference",
                        label: "Reference"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_quota_detail_week",
                        label: "Week"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_sales_week_number",
                        join: "custrecord_jg_quota_detail_week"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_week_start_date",
                        label: "Week Start Date"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_wee_end_date",
                        label: "Week End Date"
                    }),
                    search.createColumn({
                        name: "custrecord_year",
                        join: "CUSTRECORD_REFERENCE",
                        label: "Year"
                    }),

                    search.createColumn({
                        name: 'custrecord_email_actuals'
                    }),

                    search.createColumn({
                        name: 'custrecord_phone_calls_actauls'
                    }),

                    search.createColumn({
                        name: 'custrecord_visit_actuals'
                    }),

                    search.createColumn({
                        name: 'custrecord_new_prospects_actauls'
                    })
                ]
            });

            var posQuotaId = '';
            var weekTotal = 0;
            customrecord_quot_det_nonfinSearchObj.run().each(function (weekresukt) {
                posQuotaId = weekresukt.id;
                weekTotal = Number(weekresukt.getValue('custrecord_email_actuals')) + Number(weekresukt.getValue('custrecord_phone_calls_actauls')) + Number(weekresukt.getValue('custrecord_visit_actuals')) + Number(weekresukt.getValue('custrecord_new_prospects_actauls'))
            })


            log.debug('posQuotaId', posQuotaId)
            return { posQuotaId: posQuotaId, weekTotal: weekTotal, };
        }




        function getAccountsCurrentWeek(salesRep, startDateString, endDateString, soldAccount) {

            var quotes = [];
            var filters = [];
            if (soldAccount == true) {
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "within", startDateString, endDateString],
                    "AND",
                    ["class", "noneof", "4"],
                    "AND",
                    ["entitystatus", "noneof", "14"]

                ]
            } else {

                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["datecreated", "onorafter", startDateString],
                    "AND",
                    ["datecreated", "onorbefore", endDateString],
                    "AND",
                    ["class", "noneof", "4"],
                    // "AND",
                    //  ["custbody_jg_closed_won_date_time", "isempty", ""]
                ]

            }
            var estimateSearchObj = search.create({
                type: "estimate",
                settings: [{
                    "name": "consolidationtype",
                    "value": "ACCTTYPE"
                }],
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "amount",
                        label: "Amount"
                    })
                ]

            });
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);
            var totalAmount = 0
            estimateSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                quotes.push(result.id)
                totalAmount = totalAmount + Number(result.getValue('amount'));
                return true;
            });

            totalAmount = totalAmount.toFixed(2);

            /*
            estimateSearchObj.id="customsearch1714245805105";
            estimateSearchObj.title="Transaction Search TEst (copy)";
            var newSearchId = estimateSearchObj.save();
            */
            return {
                quotes: quotes,
                totalAmount: totalAmount
            }

        }


        function getAccountYtd(salesRep, ytdDateStr, ytdEndDateStr, soldAccount) {
            var quotes = [];
            var filters = [];
            log.debug('Sold Account:', soldAccount);
            log.debug('Function Fiscal Year Start Date:', ytdDateStr);
            log.debug('Function Fiscal Year End Date:', ytdEndDateStr);
            if (soldAccount == true) {
                log.debug('true');
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "within", ytdDateStr, ytdEndDateStr],
                    "AND",
                    ["class", "noneof", "4"],
                    "AND",
                    ["entitystatus", "noneof", "14"],
                    "AND",
                    [[["salesrep", "anyof", salesRep]], "OR", [["custbody_jg_opp_lead_creator_giver", "anyof", salesRep]], "AND", [["custbody_jg_opp_split_type_code", "anyof", "3"]]]
                ]
            } else {
                log.debug('False');
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["datecreated", "onorafter", ytdDateStr],
                    "AND",
                    ["datecreated", "onorbefore", ytdEndDateStr],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "isempty", ""],
                    "AND",
                    ["class", "noneof", "4"],
                    //"AND",
                    //["entitystatus", "noneof", "14"],
                    "AND",
                    [[["salesrep", "anyof", salesRep]], "OR", [["custbody_jg_opp_lead_creator_giver", "anyof", salesRep]], "AND", [["custbody_jg_opp_split_type_code", "anyof", "3"]]]
                ]

            }
            var estimateSearchObj = search.create({
                type: "estimate",
                settings: [{
                    "name": "consolidationtype",
                    "value": "ACCTTYPE"
                }],
                filters: filters,
                columns: [
                    search.createColumn({ name: "entitystatus", label: "Quote/Opportunity Status" }),

                    search.createColumn({
                        name: "amount",
                        label: "Amount"
                    }),

                    search.createColumn({
                        name: "formulacurrency",
                        formula: "case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end",
                        label: "Formula (Currency)"
                    }),

                    search.createColumn({
                        name: "formulacurrency",
                        formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({fxamount}/2) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                        label: "split amount"
                    })
                ]

            });
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);
            var totalAmount = 0
            estimateSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                log.debug('ID:', result.id);
                quotes.push(result.id)

                var closedWonAmount = result.getValue('entitystatus');
                log.debug('EntityStatus:', closedWonAmount);

                if (closedWonAmount != 14) {

                    var finalAmount = Number(result.getValue({
                        name: "formulacurrency",
                        formula: "Case when {custbody_jg_opp_split_type_code} ='50-50' then ({fxamount}/2) else (case when {custbody_jg_opp_commission_status} = 'Commissions Paid' then {custbody_pos_ds_rev_amount} else {fxamount} end) end",
                        label: "split amount"
                    }))
                    log.debug('Final Amount', finalAmount);

                    totalAmount = totalAmount + Number(finalAmount);
                    log.debug('Total Amount Function:', totalAmount);
                }
                return true;
            });

            totalAmount = totalAmount.toFixed(2);


            /*
            estimateSearchObj.id="customsearch1714245805105";
            estimateSearchObj.title="Transaction Search TEst (copy)";
            var newSearchId = estimateSearchObj.save();
            */
            return {
                quotes: quotes,
                totalAmount: totalAmount
            }


        }



        function getAccountsMonth(salesRep, soldAccount, CurrfirstDay, CurrlastDay) {
            var quotes = [];
            var filters = [];
            var totalAmount = 0;
            if (soldAccount == true) {
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "within", CurrfirstDay, CurrlastDay],
                    "AND",
                    ["class", "noneof", "4"],
                    "AND",
                    ["entitystatus", "noneof", "14"]
                ]
            } else {

                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["datecreated", "within", "thismonth", CurrfirstDay, CurrlastDay],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "isempty", ""],
                    "AND",
                    ["class", "noneof", "4"],

                ]
            }
            var estimateSearchObj = search.create({
                type: "estimate",
                settings: [{
                    "name": "consolidationtype",
                    "value": "ACCTTYPE"
                }],
                filters: filters,

                columns: [
                    search.createColumn({
                        name: "amount",
                        label: "Amount"
                    })
                ]



            });
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);

            estimateSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                quotes.push(result.id)
                totalAmount = totalAmount + Number(result.getValue('amount'));
                totalAmount = Math.round(totalAmount)
                return true;
            });




            return {
                quotes: quotes,
                totalAmount: totalAmount
            }

        }


        function getAccountsPriorMonth(salesRep, soldAccount) {
            var quotes = [];
            var filters = [];
            if (soldAccount == true) {
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "within", "lastmonth"],
                    "AND",
                    ["class", "noneof", "4"],
                    "AND",
                    ["entitystatus", "noneof", "14"]
                ];
            } else {
                filters = [
                    ["type", "anyof", "Estimate"],
                    "AND",
                    ["salesrep", "anyof", salesRep],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["datecreated", "within", "lastmonth"],
                    "AND",
                    ["custbody_jg_closed_won_date_time", "isempty", ""],
                    "AND",
                    ["class", "noneof", "4"],

                ];
            }



            var estimateSearchObj = search.create({
                type: "estimate",
                settings: [{
                    "name": "consolidationtype",
                    "value": "ACCTTYPE"
                }],
                filters: filters,

                columns: [
                    search.createColumn({
                        name: "amount",
                        label: "Amount"
                    })
                ]



            });
            var totalAmount = 0;
            var searchResultCount = estimateSearchObj.runPaged().count;
            log.debug("estimateSearchObj result count", searchResultCount);
            estimateSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                quotes.push(result.id)
                totalAmount = totalAmount + Number(result.getValue('amount'));
                return true;
            });

            /*
            estimateSearchObj.id="customsearch1714245805105";
            estimateSearchObj.title="Transaction Search TEst (copy)";
            var newSearchId = estimateSearchObj.save();
            */
            totalAmount = totalAmount.toFixed(2);


            return {
                quotes: quotes,
                totalAmount: totalAmount
            }

        }


        function getWeekTotal(recObj) {
            //email sent,phone contacts, field visits, new prospects
            var weekTotal = Number(recObj.getValue(''))


        }



        function getPosQuotedetails(startdate, endate, salesrep) {

            var customrecord_quot_det_nonfinSearchObj = search.create({
                type: "customrecord_quot_det_nonfin",
                filters: [
                    ["custrecord_jg_week_start_date", "onorafter", startdate],
                    "AND",
                    ["custrecord_jg_week_start_date", "onorbefore", endate],
                    "AND",
                    ["custrecord_reference.custrecord_rep_name", "anyof", salesrep],
                    "AND",
                    ["isinactive", "is", 'F'],

                ],
                columns: [
                    search.createColumn({
                        name: "scriptid",
                        label: "Script ID"
                    }),
                    search.createColumn({
                        name: "custrecord_reference",
                        label: "Reference"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_quota_detail_week",
                        label: "Week"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_selling_period",
                        label: "Selling Period"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_week_start_date",
                        label: "Week Start Date"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_wee_end_date",
                        label: "Week End Date"
                    }),
                    search.createColumn({
                        name: "custrecord_amount",
                        label: "Amount"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_quota_amount_actual",
                        label: "Amount Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_email_quota",
                        label: "No.of Emails"
                    }),
                    search.createColumn({
                        name: "custrecord_email_actuals",
                        label: "No.of Emails Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_field_visits",
                        label: "No.of Field Visits"
                    }),
                    search.createColumn({
                        name: "custrecord_visit_actuals",
                        label: "No.of Field Visits Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_phone_calls",
                        label: "No.of Phone Calls"
                    }),
                    search.createColumn({
                        name: "custrecord_phone_calls_actauls",
                        label: "No.of Phone Calls Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_new_prospects",
                        label: "No.of New Prospects"
                    }),
                    search.createColumn({
                        name: "custrecord_new_prospects_actauls",
                        label: "No.of New Prospects Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_service_surveys",
                        label: "No.of Service Surveys"
                    }),
                    search.createColumn({
                        name: "custrecord_service_surveys_actuals",
                        label: "No.of Service Surveys Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_proposals",
                        label: "No.of Proposals"
                    }),
                    search.createColumn({
                        name: "custrecord_proposals_actauls",
                        label: "No.of Proposals Actual"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_mtd",
                        label: "MTD"
                    }),
                    search.createColumn({
                        name: "custrecord_jg_prior_month",
                        label: "Prior Month"
                    })
                ]
            });

            var pmObj = {
                custrecord_jg_quota_amount_actual: 0,
                custrecord_email_quota: 0,
                custrecord_email_actuals: 0,
                custrecord_field_visits: 0,
                custrecord_visit_actuals: 0,
                custrecord_phone_calls: 0,
                custrecord_phone_calls_actauls: 0,
                custrecord_new_prospects_actauls: 0,
                custrecord_new_prospects: 0,
                custrecord_service_surveys: 0,
                custrecord_service_surveys_actuals: 0,
                custrecord_proposals: 0,
                custrecord_proposals_actauls: 0,
                custrecord_jg_mtd: 0,
                custrecord_amount: 0,
                salesPlan: 0

            }
            var totalSalesPlan = 0;
            var recIds = [];

            customrecord_quot_det_nonfinSearchObj.run().each(function (result) {

                //  var actualAmt = Number(result.getValue('custrecord_jg_quota_amount_actual'));
                //var amount = Number(result.getValue('custrecord_amount'));
                // var salesPlan = actualAmt/amount;
                for (var key in pmObj) {


                    pmObj[key] = Number(pmObj[key]) + Number(result.getValue(key))
                }
                recIds.push(result.id)
                return true;
            });

            log.debug('prior month actuals', pmObj);


            /*
            customrecord_quot_det_nonfinSearchObj.id="customsearch1715173261961";
            customrecord_quot_det_nonfinSearchObj.title="POS Quota Details Search prior month (copy)";
            var newSearchId = customrecord_quot_det_nonfinSearchObj.save();
            */

            return {
                recIds: recIds,
                posDeObj: pmObj
            }

        }



        function calculatePercent(value1, value2) {
            var perc = 0;
            if (value2 != 0) {
                perc = Number((value1 / value2) * 100);
                perc = parseInt(Math.round(perc));
            }


            return parseInt(perc);



        }


        function calculateAvg(totalAmount, totalNos) {
            var avg = 0;
            if (totalAmount > 0) {
                avg = Number(totalAmount) / Number(totalNos);
                // avg = Math.round(avg);
            }
            avg = avg.toFixed(2)
            return avg

        }


        function calculateWeeksBetween(date1, date2) {
            // The number of milliseconds in one week
            var ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
            // Convert both dates to milliseconds
            var date1_ms = date1.getTime();
            log.debug('Date 1:', date1_ms);

            var date2_ms = date2.getTime();
            log.debug('Date 2', date2_ms);

            // Calculate the difference in milliseconds
            var difference_ms = Math.abs(date1_ms - date2_ms);
            log.debug('Difference', difference_ms);
            log.debug('total weeks', difference_ms / ONE_WEEK)
            //log.debug('total weeks:',Math.floor(difference_ms / ONE_WEEK));
            log.debug('total weeks:', Math.round(difference_ms / ONE_WEEK));

            // Convert back to weeks and return hole weeks
            //log.emergency('total weeks',difference_ms / ONE_WEEK)
            return Math.round(difference_ms / ONE_WEEK);
        }



        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit
        }

    });