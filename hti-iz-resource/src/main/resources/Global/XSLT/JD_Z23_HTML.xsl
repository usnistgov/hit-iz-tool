<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:util="http://hl7.nist.gov/juror-doc/util" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    exclude-result-prefixes="xs util">
    <xsl:output method="xhtml" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">

        <html>
            <head>

                <style type="text/css">
                    @media screen{
                        .jurordocument fieldset{
                            font-size:100%;
                        }
                        .jurordocument table tbody tr th{
                            font-size:90%;
                        }
                        .jurordocument table tbody tr td{
                            font-size:90%;
                        }
                    }
                    @media print{
                        .jurordocument fieldset{
                            font-size:small;
                            page-break-inside:avoid;
                        }
                        .jurordocument table{
                            float:none !important;
                            page-break-before:avoid;
                            overflow:visible !important;
                            position:relative;
                        }
                        .jurordocument table tr{
                            page-break-inside:avoid;
                        }
                        .jurordocument table th{
                            font-size:x-small;
                        }
                    
                        .jurordocument table td{
                            font-size:medium;
                        }
                        * [type = text]{
                            width:98%;
                            height:15px;
                            margin:2px;
                            padding:0px;
                            background:1px #ccc;
                    
                        }
                        .jurordocument h3{
                            font-size:xx-small;
                        }
                        .jurordocument p{
                            font-size:x-small;
                        }
                    
                    
                        .jurordocument * [type = checkbox]{
                            width:10px;
                            height:10px;
                            margin:2px;
                            padding:0px;
                            background:1px #ccc;
                        }
                    }
                    
                    .jurordocument * [type = text]{
                        width:95%;
                    
                    }
                    
                    
                    .jurordocument fieldset{
                        width:95%;
                        border:1px solid #446BEC;
                        font-size:small;
                    }
                    .embSpace{
                        padding-left:25px;
                    }
                    .noData{
                        background:#D2D2D2;
                    }
                    .jurordocument table{
                        width:98%;
                        border:1px groove;
                        margin:0 auto;
                        page-break-inside:avoid;
                    }
                    .jurordocument table tr{
                        border:1px groove;
                    }
                    .jurordocument table th{
                        border:1px groove;
                    }
                    .jurordocument table td{
                        border:1px groove;
                        empty-cells:show;
                    }
                    .jurordocument table thead{
                        border:1px groove;
                        background:#446BEC;
                        text-align:center;
                        color:white;
                    }
                    .jurordocument table[id = inspectionStatus] thead tr th:last-child{
                        width:2%;
                        color:black;
                    }
                    .jurordocument table[id = inspectionStatus] thead tr th:nth-last-child(2){
                        width:2%;
                        color:black;
                    }
                    .jurordocument table[id = inspectionStatus] thead tr th:nth-last-child(3){
                        width:45%;
                    }
                    .jurordocument table tbody tr th{
                        text-align:center;
                        background:#C6DEFF;
                    }
                    .jurordocument table tbody tr td{
                        text-align:left;
                        font-size:medium;
                    }
                    .jurordocument table tbody tr td [type = text]{
                        text-align:left;
                        margin-left:1%;
                    }
                    .jurordocument table caption{
                        font-weight:bold;
                        color:#0840F8;
                    }</style>

            </head>
            <body>

                <div class="jurordocument">

                    <table>
                        <thead>
                            <tr>
                                <th colspan="2">Return an Acknowledgement</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>Test Case ID</th>

                                <td>
                                    <xsl:value-of select="ACK/@testcaseName"/>
                                </td>

                            </tr>
                            <tr>
                                <th>Juror ID</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>
                            <tr>
                                <th>Juror Name</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>
                            <tr>
                                <th>HIT System Tested</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>
                            <tr>
                                <th>Inspection Date/Time</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>
                            <tr>
                                <th>Inspection Settlement (Pass/Fail)</th>
                                <td>
                                    <table id="inspectionStatus">
                                        <thead>
                                            <tr>
                                                <th>Pass</th>
                                                <th>Fail</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            <tr>
                                                <td>
                                                  <input type="checkbox"/>
                                                </td>
                                                <td>
                                                  <input type="checkbox"/>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <th>Reason Failed</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>
                            <tr>
                                <th>Juror Comments</th>
                                <td>
                                    <input style="background: 1px  #E2E2E2;" type="text"
                                        maxlength="50" value=""/>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <xsl:choose>
                        <xsl:when test="exists(//ERR)">
                            <h3>DISPLAY VERIFICATION</h3>


                            <fieldset>
                                <p>This Test Case-specific Juror Document provides a checklist for
                                    the Tester to use during certification testing for assessing the
                                    health information technology's ability to receive and process a
                                    Return an Acknowledgement Z23 message (in response to a "Send
                                    Unsolicited Immunization Update Using a VXU" Z22 message) in
                                    which an Error is returned in the message. </p>
                                <p>The exact wording and format of the display in the health
                                    information technology (HIT) is not in-scope for this test.</p>

                            </fieldset>
                            <br/>
                            <table>
                                <thead>

                                    <tr>
                                        <th>Return an Acknowledgement</th>
                                    </tr>
                                </thead>
                                <tbody>


                                    <tr>
                                        <td>
                                            <p>The receiving HIT system being tested shall process
                                                the Z23 ACK error notification message correctly;
                                                the issue identified in the error notification <u>must
                                                be made visible</u> in the system.</p>
                                            <!-- <xsl:for-each select="//ERR">
                                                <p align="center">
                                                  <xsl:value-of select="ERR.8"/>
                                                </p>
                                            </xsl:for-each> -->
                                        </td>
                                    </tr>



                                </tbody>

                            </table>
                        </xsl:when>
                        <xsl:otherwise>
                            <h3>DISPLAY VERIFICATION</h3>


                            <fieldset>
                                <p>This Test Case-specific Juror Document provides a checklist for
                                    the Tester to use during certification testing for assessing the
                                    health information technology's ability to receive and process a
                                    Return an Acknowledgement Z23 message (in response to a "Send
                                    Unsolicited Immunization Update Using a VXU" Z22 message) in
                                    which NO Error is returned in the message. </p>
                                <p>The exact wording and format of the display in the health
                                    information technology (HIT) is not in-scope for this test.</p>

                            </fieldset>
                            <br/>
                            <table>
                                <thead>

                                    <tr>
                                        <th>Return an Acknowledgement</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    <tr>
                                        <td>
                                            <p>The receiving HIT system being tested shall process
                                                the Z23 ACK message correctly; a positive
                                                notification indicating that the ACK message was
                                                processed correctly <u>need not be made visible</u>
                                                in the system.</p>

                                        </td>
                                    </tr>


                                </tbody>

                            </table>
                        </xsl:otherwise>
                    </xsl:choose>
                </div>
            </body>
        </html>

    </xsl:template>
</xsl:stylesheet>
