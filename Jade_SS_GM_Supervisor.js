/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/render', 'N/record', 'N/search', 'N/xml', 'N/runtime', 'N/format'],
    /**
     * @param{render} render
     */
    (render, record, search, xmlObj, runtime, format) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {




            var fileNames = [];

            var currentDate = new Date();
            const lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

            var startDate = new Date(lastWeekDate);
            startDate.setDate(lastWeekDate.getDate() - lastWeekDate.getDay());
            var endDate = new Date(lastWeekDate);

            endDate.setDate(lastWeekDate.getDate() + (6 - lastWeekDate.getDay()));
            log.debug('Week Start and End Date', startDate + '@@@@' + endDate);
            // return;

            // P1X-571 and 639
            try {
                processDynamicReports(startDate, endDate);
            } catch (e) {
                log.error('Error process dynamic report', e);
            }
			
			//return;
            var gmsSearchObj = search.load({
                id: 'customsearch_gm_plant'
            });

            var gmObj = {};
            gmsSearchObj.run().each(function(res) {
                var gm = res.getValue('custrecord_general_manager');
                var plant = res.id
                if (gmObj[gm]) {

                    gmObj[gm].push(plant)
                } else {
                    gmObj[gm] = [plant]
                }

                return true;
            })
            log.debug('gmObj', gmObj)


            for (var key in gmObj) {

                var plants = gmObj[key];
                var gm = key;
                log.debug('plants', plants)
                var wpmReq = record.create({
                    type: 'customrecord_wpm_report_request',
                });


                wpmReq.setValue('custrecord_wpm_plant_gm', gm)




                // get all plants report for this gm
                // var startDate = '6/2/2024';
                // var endDate = '6/8/2024';
                wpmReq.setText('custrecord_wpm_week_start_date', startDate)

                wpmReq.setText('custrecord_wpm_week_endate', endDate)
                var recDetails = getAllSavedRecords(startDate, endDate, 0, plants);
                log.debug('rec details', recDetails);

                recDetails.forEach(function(res) {

                    fileNames.push(res.wpmReqId + '_' + res.salesRepName + '_' + res.recId);


                })

                var fileNames = getFileNames(recDetails);

                log.debug('GM-->' + gm, recDetails);
                var pdfFileId = createFile(fileNames, gm);
                log.debug('pdfFileId', pdfFileId);
                if (Number(pdfFileId) > 0) {
                    wpmReq.setValue('custrecord_wpm_report', pdfFileId)
                }
                wpmReq.save();


            }



            // get all the employees for the gms plant



            var searchObj = search.load({
                id: 'customsearch_supervisor_search'
            });



            searchObj.run().each(function(result) {

                var supervisor = result.getValue({
                    name: "supervisor",
                    summary: "GROUP",
                    label: "Supervisor"
                });

                var wpmReq = record.create({
                    type: 'customrecord_wpm_report_request'
                });

                // var startDate = '6/2/2024';
                // var endDate = '6/8/2024';

                wpmReq.setValue('custrecord_wpm_supervisor', supervisor)
                wpmReq.setText('custrecord_wpm_week_start_date', startDate)

                wpmReq.setText('custrecord_wpm_week_endate', endDate);

                var recDetails = getAllSavedRecords(startDate, endDate, supervisor, []);
                log.debug('supervisor-->' + supervisor, recDetails);

                var fileNames = getFileNames(recDetails);

                log.debug('fileNames', fileNames)

                var pdfFileId = createFile(fileNames, supervisor);
                log.debug('pdfFileId for supervisor', pdfFileId);
                if (Number(pdfFileId) > 0) {
                    wpmReq.setValue('custrecord_wpm_report', pdfFileId)
                }
                wpmReq.save();



                return true;




            });

            return;

        }




        function getFileNames(recDetails) {

            var fileNames = [];
            recDetails.forEach(function(res) {

                fileNames.push(res.salesTerritory + '_' + res.wpmReqId + '_' + res.salesRepName + '_' + res.recId);


            })
            return fileNames;

        }



        function recordExists(startDate, endDate, supervisor, plantGm) {

            var customrecord_wpm_report_requestSearchObj = search.create({
                type: "customrecord_wpm_report_request",
                filters: [
                    ["custrecord_wpm_supervisor", "anyof", "1199073"],
                    "AND",
                    ["custrecord_wpm_week_start_date", "within", "6/2/2024", "6/8/2024"],
                    "AND",
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_wpm_report_email_sent", "is", "T"]
                ],
                columns: [
                    search.createColumn({
                        name: "scriptid",
                        label: "Script ID"
                    }),
                    search.createColumn({
                        name: "custrecord_wpm_plant",
                        label: "Plant"
                    })
                ]
            });
            var searchResultCount = customrecord_wpm_report_requestSearchObj.runPaged().count;
            log.debug("customrecord_wpm_report_requestSearchObj result count", searchResultCount);
            customrecord_wpm_report_requestSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                return true;
            });

            /*
            customrecord_wpm_report_requestSearchObj.id="customsearch1722241268180";
            customrecord_wpm_report_requestSearchObj.title="WPM Report Request Search su (copy)";
            var newSearchId = customrecord_wpm_report_requestSearchObj.save();
            */


        }




        function createFile(fileNames, employeeId) {

            var urls = getFileUrls(fileNames)

            if (urls.length > 0) {
                // var urls = ["/core/media/media.nl?id=23154&c=953134_SB2&h=Y_olfbk7MknSAOmljLP7HIHn9wPuJ9Hc8SnUxnjQPoPrGYfX&_xt=.pdf", "/core/media/media.nl?id=23155&c=953134_SB2&h=F3sdsOaIOX-4GQu-InclX7DwwHdAI4h3JxvExL6gLVT7eDmx&_xt=.pdf", "/core/media/media.nl?id=23156&c=953134_SB2&h=b8tm4C5bMhpFxvYvJypx9IGl6at1zSoWDwt_6QIuN64X8R6D&_xt=.pdf", "/core/media/media.nl?id=23157&c=953134_SB2&h=j6rP4iXADTI1bZNfjJbDRPlvn-y4gEs5VfzzSxLsuVBb2s-K&_xt=.pdf", "/core/media/media.nl?id=23158&c=953134_SB2&h=f7MyA4vDXeWotxW_Br4kzYeN_Pf4LbtWjdEEsSnJCt-MX244&_xt=.pdf", "/core/media/media.nl?id=23159&c=953134_SB2&h=z1WMhuPniXcTScu2seXhWsNJ0iWZPKl1MfaQI475w059tlmD&_xt=.pdf", "/core/media/media.nl?id=23160&c=953134_SB2&h=OgjAu2l1A10k-0MvyTVumiUu6EPDcVkm1FIXEswVyJa7hAys&_xt=.pdf", "/core/media/media.nl?id=23161&c=953134_SB2&h=1X0nHmcfRKuA3py2J0nSPSQQAA2quRkFbEAkjbmNZdaZ0jKm&_xt=.pdf", "/core/media/media.nl?id=23162&c=953134_SB2&h=-RncPpiIbGaiagCRl-oMyG65CGN-ZJxH1GaM6_X_dg0DtabM&_xt=.pdf", "/core/media/media.nl?id=23163&c=953134_SB2&h=M2XHAjVDozDTlpeuUXLPIitddNi-AU4R1yby_G7ASqmE9Gh6&_xt=.pdf", "/core/media/media.nl?id=23164&c=953134_SB2&h=ofJRMmATCvYB9b3PuAKJv6jv0AUYIxfFzVwyYVbCJXQS1BLe&_xt=.pdf", "/core/media/media.nl?id=23165&c=953134_SB2&h=r-GiSooHrbgyR9gyCurm5jBFwUwvqItLsTNXfi2fVqDHReFA&_xt=.pdf", "/core/media/media.nl?id=23166&c=953134_SB2&h=_eGs8VREv9kReZdmwgSeURjIFwx5Au9PrLmWn8xAo8JKYkGY&_xt=.pdf", "/core/media/media.nl?id=23167&c=953134_SB2&h=adG09Xy9-IrDp39J1rsGAeM4NYSiduQrCPX5rvFhpcY6wzvt&_xt=.pdf", "/core/media/media.nl?id=23168&c=953134_SB2&h=6JNT0kjvnrR70tdZQ9JY7WSE_YMQfar83-cgCcS4PF0hQ4EP&_xt=.pdf", "/core/media/media.nl?id=23169&c=953134_SB2&h=SQoVNe3yvKcforbkRin4MB6dhvu_T9gY-JCBcehQoFy88F5N&_xt=.pdf", "/core/media/media.nl?id=23170&c=953134_SB2&h=GVkImIBd6iIeQYXE1ptUdSdiWG0aPcLwFt-5fK0nfLng6Pcf&_xt=.pdf", "/core/media/media.nl?id=23171&c=953134_SB2&h=kRwO2a0X-m9Dw-iJhj58j0fZiXgzbSoOtNidNjpvV-DDFPhf&_xt=.pdf", "/core/media/media.nl?id=23172&c=953134_SB2&h=hyNyQUFrr_kLcnlssTNyuTPrI8QI_Y_TzryEm86ZHQl6WfMl&_xt=.pdf", "/core/media/media.nl?id=23173&c=953134_SB2&h=PpNjFfLMdk2bqsSaDPkfdphRqTYkV-oXZ3OliQQY4BH10TaJ&_xt=.pdf", "/core/media/media.nl?id=23174&c=953134_SB2&h=hMouMesdTwnqhwd_ta6j1DGi-H3io5On-hAe42SM8x_8WJEk&_xt=.pdf", "/core/media/media.nl?id=23175&c=953134_SB2&h=Yq2HQaI8isigUM7tTHccyubXmCTpMFVSDpL0NRF9GmmLx-16&_xt=.pdf", "/core/media/media.nl?id=23176&c=953134_SB2&h=Wq4XucxzO7UnTEM3WOASGqjo8COG2sQkEZtYYQJTwp02Y5iy&_xt=.pdf", "/core/media/media.nl?id=23177&c=953134_SB2&h=i4EJUTFzk-Eh-SUc9_lQ7MiIRbxlYCXpdwPGSR1R2KzfZHSB&_xt=.pdf", "/core/media/media.nl?id=23178&c=953134_SB2&h=t6c4ivXPXYH31GLBAzQ89iUXox0Wx7-Chi5HTLcEQZlsSCHY&_xt=.pdf", "/core/media/media.nl?id=23179&c=953134_SB2&h=jC4Dp6bvpvwUdAd-t8syjfVQLpguJCdhKMo89k3R94N8u4Hw&_xt=.pdf", "/core/media/media.nl?id=23180&c=953134_SB2&h=iWeaL1rPUlmZZmYw1M2JSSWI3LwdJ43ynpjQltFZD0sqOdlU&_xt=.pdf", "/core/media/media.nl?id=23181&c=953134_SB2&h=o8j8-HY35z9KEJgaAK0LyZG2XRhmr_fSmVOpTvu-dk9vDX9i&_xt=.pdf", "/core/media/media.nl?id=23182&c=953134_SB2&h=bPjkWgFg7-NAsd2B1Hs0hj-LGnndOWG31VNjKRmGXn9zHkNx&_xt=.pdf", "/core/media/media.nl?id=23183&c=953134_SB2&h=fOaX-_tShIa9qrzmwIgODMw_W4a4g7TWawvDnbSgPdx3RBIz&_xt=.pdf", "/core/media/media.nl?id=23184&c=953134_SB2&h=dz28rCyCbUrnoCzUmkZfgKZ2JTkxaIXAj5wnS31ix0aHgFJx&_xt=.pdf", "/core/media/media.nl?id=23185&c=953134_SB2&h=tROgF0tIz1vEwcmsvWH83YkbdbkwuqhJWjfYzS1hZmpfQP80&_xt=.pdf", "/core/media/media.nl?id=23186&c=953134_SB2&h=9v7UqX6krrUe-gu02JOjYn5IGBEOiYsAy0svq6YT4HoZQ8Rg&_xt=.pdf", "/core/media/media.nl?id=23187&c=953134_SB2&h=2AfhQuarYO5NdZapf_5hNjn9R5boRYzfkcPXFtWgHfAbXmDg&_xt=.pdf", "/core/media/media.nl?id=23188&c=953134_SB2&h=ENAZl4h8kCW5bQP2qSSEgpvyh2xZO_c3EFhG7FwJdip0NOav&_xt=.pdf", "/core/media/media.nl?id=23189&c=953134_SB2&h=q4CCtVs_qK7_NkvRGsugVU63aI9vf0ue3vE5E6dI9LMPepar&_xt=.pdf", "/core/media/media.nl?id=23190&c=953134_SB2&h=XPIOjG-wjsYOyG9VCoLwSfZ_cN9kNAkPH9HFaWBTh4R9WcH8&_xt=.pdf"]
                var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                xml += "<pdfset>";


                urls.forEach(function(res) {

                    xml += "<pdf src='" + xmlObj.escape(res) + "'/>";
                    // xml += '</pdf>'


                });

                xml += '</pdfset>'

                var pdfFile = render.xmlToPdf({
                    xmlString: xml
                });

                pdfFile.folder = 120863
                pdfFile.name = "WPM_REPORT_" + employeeId + '_' + new Date();
                try {
                    var pdfFileId = pdfFile.save();
                    return pdfFileId;
                } catch (e) {
                    log.error('Error creating file', e);
                    return 0;
                }

            } else {
                return 0
            }

        }




        function getAllSavedRecords(weekStartDate, weekEndDate, supervisor, plants) {


            var starDate = format.format({
                value: weekStartDate,
                type: format.Type.DATE
            })

            var endDate = format.format({
                value: weekEndDate,
                type: format.Type.DATE
            })


            var filters = [
                ["custrecord_wpm_week_sd", "onorafter", starDate],
                "AND",
                ["custrecord_wpm_week_ed", "onorbefore", endDate]
            ]

            if (Number(supervisor) > 0) {
                filters.push("AND");
                filters.push(["custrecord_wpm_sales_rep.supervisor", "anyof", supervisor])
            }

            if (plants.length > 0) {
                filters.push("AND");
                filters.push(["custrecord_wpm_sales_rep.location", "anyof", plants])
            }


            var customrecord_wpm_reportSearchObj = search.create({
                type: "customrecord_wpm_report",
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "custrecord_wpm_sales_rep",
                        label: "Sales Rep"
                    }),
                    search.createColumn({
                        name: "custrecord_wpm_req",
                        label: "Sales Rep"
                    }),
                    search.createColumn({
                        name: "custentity_jg_employee_sales_territory",
                        join: 'custrecord_wpm_sales_rep',
                        label: "Sales Rep"
                    })

                ]
            });

            var salesRepObj = {};
            var searchResultCount = customrecord_wpm_reportSearchObj.runPaged().count;
            log.debug("customrecord_wpm_reportSearchObj result count", searchResultCount);
            var wpmRecs = [];
            customrecord_wpm_reportSearchObj.run().each(function(result) {
                var salesRep = result.getText('custrecord_wpm_sales_rep');
                var salesTerritory = result.getText({
                    name: "custentity_jg_employee_sales_territory",
                    join: 'custrecord_wpm_sales_rep',
                    label: "Sales Rep"
                })
                wpmRecs.push({
                    salesRepName: salesRep,
                    wpmReqId: result.getValue('custrecord_wpm_req'),
                    recId: result.id,
                    salesTerritory: salesTerritory

                })

                return true;
            });

            return wpmRecs

            /*
            customrecord_wpm_reportSearchObj.id="customsearch1717156278259";
            customrecord_wpm_reportSearchObj.title="WPM Report Search (copy)";
            var newSearchId = customrecord_wpm_reportSearchObj.save();
            */

        }

        function getFileUrls(fileNames) {
            var fileUrls = [];
            log.debug('fileNames', fileNames)
            var filters = [
                [
                    ["name", "is", "TEST"]
                ],
            ]


            fileNames.forEach(function(res) {

                filters.push("OR")
                filters.push([
                    ["name", "is", res]
                ])

            })
            var fileSearchObj = search.create({
                type: "file",
                filters: filters,
                columns: [
                    search.createColumn({
                        name: "name",
                        label: "Name",
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: "folder",
                        label: "Folder"
                    }),
                    search.createColumn({
                        name: "documentsize",
                        label: "Size (KB)"
                    }),
                    search.createColumn({
                        name: "url",
                        label: "URL"
                    }),
                    search.createColumn({
                        name: "created",
                        label: "Date Created"
                    }),
                    search.createColumn({
                        name: "modified",
                        label: "Last Modified"
                    }),
                    search.createColumn({
                        name: "filetype",
                        label: "Type"
                    })
                ]
            });
            var searchResultCount = fileSearchObj.runPaged().count;
            log.debug("fileSearchObj result count", searchResultCount);
            fileSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                var fileName = result.getValue('name');
                fileName = fileName.toLowerCase();
                if (fileName != 'test') {
                    fileUrls.push(result.getValue('url'))
                    return true;
                }

            });

            log.debug('fileUrls', fileUrls);
            return fileUrls

        }


        function getAllSubordinates(supervisor) {
            var salesRepIds = [];
            var employeeSearchObj = search.create({
                type: "employee",
                filters: [
                    ["supervisor", "anyof", supervisor],
                    "AND",
                    ["custentity_jg_employee_sales_role", "anyof", "1", "3"]
                ],
                columns: [
                    search.createColumn({
                        name: "supervisor",
                        label: "Supervisor"
                    }),
                    search.createColumn({
                        name: "firstname",
                        label: "First Name"
                    }),
                    search.createColumn({
                        name: "lastname",
                        label: "Last Name"
                    }),
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
            var searchResultCount = employeeSearchObj.runPaged().count;
            log.debug("employeeSearchObj result count", searchResultCount);
            employeeSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                salesRepIds.push(result.id)
                return true;
            });

            /*
            employeeSearchObj.id="customsearch1716395306388";
            employeeSearchObj.title="Supervisor Search (copy)";
            var newSearchId = employeeSearchObj.save();
            */
            return salesRepIds;

        }


        function processDynamicReports(startDate, endDate) {
            log.debug('startDate', startDate)
            // get all the employee search where wpm saved search field is not empty

            var managers = search.load({
                id: 'customsearch_wpm_dy1'
            });

            var weekStartDate = format.format({
                value: startDate,
                type: format.Type.DATE
            })

            var weekEndDate = format.format({
                value: endDate,
                type: format.Type.DATE
            })

            var supDetails = [];

            managers.run().each(function(res) {

                supDetails.push({
                    supervisor: res.id,
                    savedSearchId: res.getValue({
                        name: "custentity_wpm_saved_search",

                    })
                })
                return true;
            })

            log.debug('supDetails', supDetails)
            
            supDetails.forEach(function(res) {
                var furls = [];
			var salesRepIds = [];
                var loadSearchObj = search.load({
                    id: res.savedSearchId
                });

                loadSearchObj.filters.push(

                    search.createFilter({
                        name: 'custrecord_wpm_week_sd',
                        operator: 'onorafter',
                        values: weekStartDate


                    }),
                    search.createFilter({
                        name: 'custrecord_wpm_week_ed',
                        operator: 'onorbefore',
                        values: weekEndDate


                    })




                )

                loadSearchObj.columns.push(
                    search.createColumn({
                        name: "url",
                        join: "file",
                        summary: "GROUP",
                        label: "URL"
                    })
                )


                loadSearchObj.run().each(function(res1) {
					
					
                     var salesRep = res1.getValue({
						 name: "custrecord_wpm_sales_rep",
						 summary: "GROUP",
						 label: "Sales Rep"
					});
					
					if(salesRepIds.indexOf(salesRep) < 0 ){
						 var fileUrl = res1.getValue({
                        name: "url",
                        join: "file",
                        summary: "GROUP",
                        label: "URL"
                    })
                    furls.push(fileUrl);
                    log.debug('fileUrl', fileUrl);
					}else{
						salesRepIds.push(salesRep);
						
					}
                   
                    return true;
                })



                if (furls.length > 0) {
                    // var urls = ["/core/media/media.nl?id=23154&c=953134_SB2&h=Y_olfbk7MknSAOmljLP7HIHn9wPuJ9Hc8SnUxnjQPoPrGYfX&_xt=.pdf", "/core/media/media.nl?id=23155&c=953134_SB2&h=F3sdsOaIOX-4GQu-InclX7DwwHdAI4h3JxvExL6gLVT7eDmx&_xt=.pdf", "/core/media/media.nl?id=23156&c=953134_SB2&h=b8tm4C5bMhpFxvYvJypx9IGl6at1zSoWDwt_6QIuN64X8R6D&_xt=.pdf", "/core/media/media.nl?id=23157&c=953134_SB2&h=j6rP4iXADTI1bZNfjJbDRPlvn-y4gEs5VfzzSxLsuVBb2s-K&_xt=.pdf", "/core/media/media.nl?id=23158&c=953134_SB2&h=f7MyA4vDXeWotxW_Br4kzYeN_Pf4LbtWjdEEsSnJCt-MX244&_xt=.pdf", "/core/media/media.nl?id=23159&c=953134_SB2&h=z1WMhuPniXcTScu2seXhWsNJ0iWZPKl1MfaQI475w059tlmD&_xt=.pdf", "/core/media/media.nl?id=23160&c=953134_SB2&h=OgjAu2l1A10k-0MvyTVumiUu6EPDcVkm1FIXEswVyJa7hAys&_xt=.pdf", "/core/media/media.nl?id=23161&c=953134_SB2&h=1X0nHmcfRKuA3py2J0nSPSQQAA2quRkFbEAkjbmNZdaZ0jKm&_xt=.pdf", "/core/media/media.nl?id=23162&c=953134_SB2&h=-RncPpiIbGaiagCRl-oMyG65CGN-ZJxH1GaM6_X_dg0DtabM&_xt=.pdf", "/core/media/media.nl?id=23163&c=953134_SB2&h=M2XHAjVDozDTlpeuUXLPIitddNi-AU4R1yby_G7ASqmE9Gh6&_xt=.pdf", "/core/media/media.nl?id=23164&c=953134_SB2&h=ofJRMmATCvYB9b3PuAKJv6jv0AUYIxfFzVwyYVbCJXQS1BLe&_xt=.pdf", "/core/media/media.nl?id=23165&c=953134_SB2&h=r-GiSooHrbgyR9gyCurm5jBFwUwvqItLsTNXfi2fVqDHReFA&_xt=.pdf", "/core/media/media.nl?id=23166&c=953134_SB2&h=_eGs8VREv9kReZdmwgSeURjIFwx5Au9PrLmWn8xAo8JKYkGY&_xt=.pdf", "/core/media/media.nl?id=23167&c=953134_SB2&h=adG09Xy9-IrDp39J1rsGAeM4NYSiduQrCPX5rvFhpcY6wzvt&_xt=.pdf", "/core/media/media.nl?id=23168&c=953134_SB2&h=6JNT0kjvnrR70tdZQ9JY7WSE_YMQfar83-cgCcS4PF0hQ4EP&_xt=.pdf", "/core/media/media.nl?id=23169&c=953134_SB2&h=SQoVNe3yvKcforbkRin4MB6dhvu_T9gY-JCBcehQoFy88F5N&_xt=.pdf", "/core/media/media.nl?id=23170&c=953134_SB2&h=GVkImIBd6iIeQYXE1ptUdSdiWG0aPcLwFt-5fK0nfLng6Pcf&_xt=.pdf", "/core/media/media.nl?id=23171&c=953134_SB2&h=kRwO2a0X-m9Dw-iJhj58j0fZiXgzbSoOtNidNjpvV-DDFPhf&_xt=.pdf", "/core/media/media.nl?id=23172&c=953134_SB2&h=hyNyQUFrr_kLcnlssTNyuTPrI8QI_Y_TzryEm86ZHQl6WfMl&_xt=.pdf", "/core/media/media.nl?id=23173&c=953134_SB2&h=PpNjFfLMdk2bqsSaDPkfdphRqTYkV-oXZ3OliQQY4BH10TaJ&_xt=.pdf", "/core/media/media.nl?id=23174&c=953134_SB2&h=hMouMesdTwnqhwd_ta6j1DGi-H3io5On-hAe42SM8x_8WJEk&_xt=.pdf", "/core/media/media.nl?id=23175&c=953134_SB2&h=Yq2HQaI8isigUM7tTHccyubXmCTpMFVSDpL0NRF9GmmLx-16&_xt=.pdf", "/core/media/media.nl?id=23176&c=953134_SB2&h=Wq4XucxzO7UnTEM3WOASGqjo8COG2sQkEZtYYQJTwp02Y5iy&_xt=.pdf", "/core/media/media.nl?id=23177&c=953134_SB2&h=i4EJUTFzk-Eh-SUc9_lQ7MiIRbxlYCXpdwPGSR1R2KzfZHSB&_xt=.pdf", "/core/media/media.nl?id=23178&c=953134_SB2&h=t6c4ivXPXYH31GLBAzQ89iUXox0Wx7-Chi5HTLcEQZlsSCHY&_xt=.pdf", "/core/media/media.nl?id=23179&c=953134_SB2&h=jC4Dp6bvpvwUdAd-t8syjfVQLpguJCdhKMo89k3R94N8u4Hw&_xt=.pdf", "/core/media/media.nl?id=23180&c=953134_SB2&h=iWeaL1rPUlmZZmYw1M2JSSWI3LwdJ43ynpjQltFZD0sqOdlU&_xt=.pdf", "/core/media/media.nl?id=23181&c=953134_SB2&h=o8j8-HY35z9KEJgaAK0LyZG2XRhmr_fSmVOpTvu-dk9vDX9i&_xt=.pdf", "/core/media/media.nl?id=23182&c=953134_SB2&h=bPjkWgFg7-NAsd2B1Hs0hj-LGnndOWG31VNjKRmGXn9zHkNx&_xt=.pdf", "/core/media/media.nl?id=23183&c=953134_SB2&h=fOaX-_tShIa9qrzmwIgODMw_W4a4g7TWawvDnbSgPdx3RBIz&_xt=.pdf", "/core/media/media.nl?id=23184&c=953134_SB2&h=dz28rCyCbUrnoCzUmkZfgKZ2JTkxaIXAj5wnS31ix0aHgFJx&_xt=.pdf", "/core/media/media.nl?id=23185&c=953134_SB2&h=tROgF0tIz1vEwcmsvWH83YkbdbkwuqhJWjfYzS1hZmpfQP80&_xt=.pdf", "/core/media/media.nl?id=23186&c=953134_SB2&h=9v7UqX6krrUe-gu02JOjYn5IGBEOiYsAy0svq6YT4HoZQ8Rg&_xt=.pdf", "/core/media/media.nl?id=23187&c=953134_SB2&h=2AfhQuarYO5NdZapf_5hNjn9R5boRYzfkcPXFtWgHfAbXmDg&_xt=.pdf", "/core/media/media.nl?id=23188&c=953134_SB2&h=ENAZl4h8kCW5bQP2qSSEgpvyh2xZO_c3EFhG7FwJdip0NOav&_xt=.pdf", "/core/media/media.nl?id=23189&c=953134_SB2&h=q4CCtVs_qK7_NkvRGsugVU63aI9vf0ue3vE5E6dI9LMPepar&_xt=.pdf", "/core/media/media.nl?id=23190&c=953134_SB2&h=XPIOjG-wjsYOyG9VCoLwSfZ_cN9kNAkPH9HFaWBTh4R9WcH8&_xt=.pdf"]
                    var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                    xml += "<pdfset>";


                    furls.forEach(function(res) {

                        xml += "<pdf src='" + xmlObj.escape(res) + "'/>";
                        // xml += '</pdf>'


                    });

                    xml += '</pdfset>'

                    var pdfFile = render.xmlToPdf({
                        xmlString: xml
                    });

                    pdfFile.folder = 120863
                    pdfFile.name = "WPM_REPORT_" + res.supervisor + '_' + new Date();
                    try {
                        var pdfFileId = pdfFile.save();
                        log.debug('pdfFileId', pdfFileId)
                        if (pdfFileId) {

                            var wpmReq = record.create({
                                type: 'customrecord_wpm_report_request'
                            });

                            // var startDate = '6/2/2024';
                            // var endDate = '6/8/2024';

                            wpmReq.setValue('custrecord_wpm_supervisor', res.supervisor)
                            wpmReq.setValue('custrecord_wpm_week_start_date', startDate)
                            wpmReq.setValue('custrecord_wpm_report', pdfFileId);
                            wpmReq.setValue('custrecord_wpm_week_endate', endDate);
                            wpmReq.save();

                        }
                        return pdfFileId;
                    } catch (e) {
                        log.error('Error creating file', e);
                        return 0;
                    }

                } else {
                    return 0
                }



            })

            //	/core/media/media.nl?id=404115&c=953134_SB2&h=GckXfrDhsrBvMFDLF6ox_G5XwBiSDEV-tilIEJezaAtLPTXy&_xt=.pdf




        }

        return {
            execute
        }

    });