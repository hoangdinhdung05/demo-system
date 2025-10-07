package com.training.demo.helpers.Reports;

import com.training.demo.dto.response.User.ExportUserResponse;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.design.*;
import net.sf.jasperreports.engine.type.*;
import java.awt.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JasperReportGenerator {

    public JasperPrint generateUserReport(List<ExportUserResponse> users) throws JRException {

        // 1️⃣ Thiết kế tổng thể
        JasperDesign jasperDesign = new JasperDesign();
        jasperDesign.setName("user_report");
        jasperDesign.setPageWidth(595);
        jasperDesign.setPageHeight(842);
        jasperDesign.setColumnWidth(555);
        jasperDesign.setLeftMargin(20);
        jasperDesign.setRightMargin(20);
        jasperDesign.setTopMargin(20);
        jasperDesign.setBottomMargin(20);

        // 2️⃣ Khai báo các field tương ứng DTO
        String[][] fields = {
                {"id", "java.lang.Long"},
                {"firstName", "java.lang.String"},
                {"lastName", "java.lang.String"},
                {"username", "java.lang.String"},
                {"email", "java.lang.String"}
        };
        for (String[] f : fields) {
            JRDesignField field = new JRDesignField();
            field.setName(f[0]);
            field.setValueClassName(f[1]);
            jasperDesign.addField(field);
        }

        // 3️⃣ Title
        JRDesignBand titleBand = new JRDesignBand();
        titleBand.setHeight(50);

        JRDesignStaticText titleText = new JRDesignStaticText();
        titleText.setX(0);
        titleText.setY(10);
        titleText.setWidth(555);
        titleText.setHeight(30);
        titleText.setText("USER REPORT");
        titleText.setHorizontalTextAlign(HorizontalTextAlignEnum.CENTER);
        titleText.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        titleText.setFontSize(20f);
        titleText.setBold(true);
        titleText.setForecolor(new Color(60, 60, 60));

        titleBand.addElement(titleText);
        jasperDesign.setTitle(titleBand);

        // 4️⃣ Column Header
        JRDesignBand columnHeader = new JRDesignBand();
        columnHeader.setHeight(25);

        int x = 0;
        columnHeader.addElement(createHeaderCell("ID", x, 40));
        x += 40;
        columnHeader.addElement(createHeaderCell("First Name", x, 100));
        x += 100;
        columnHeader.addElement(createHeaderCell("Last Name", x, 100));
        x += 100;
        columnHeader.addElement(createHeaderCell("Username", x, 150));
        x += 150;
        columnHeader.addElement(createHeaderCell("Email", x, 165));

        jasperDesign.setColumnHeader(columnHeader);

        // 5️⃣ Detail Band
        JRDesignBand detailBand = new JRDesignBand();
        detailBand.setHeight(20);

        int dx = 0;
        detailBand.addElement(createDetailCell("$F{id}", dx, 40, HorizontalTextAlignEnum.CENTER));
        dx += 40;
        detailBand.addElement(createDetailCell("$F{firstName}", dx, 100, HorizontalTextAlignEnum.CENTER));
        dx += 100;
        detailBand.addElement(createDetailCell("$F{lastName}", dx, 100, HorizontalTextAlignEnum.CENTER));
        dx += 100;
        detailBand.addElement(createDetailCell("$F{username}", dx, 150, HorizontalTextAlignEnum.CENTER));
        dx += 150;
        detailBand.addElement(createDetailCell("$F{email}", dx, 165, HorizontalTextAlignEnum.CENTER));

        ((JRDesignSection) jasperDesign.getDetailSection()).addBand(detailBand);

        // 6️⃣ Footer
        JRDesignBand footerBand = new JRDesignBand();
        footerBand.setHeight(25);

        JRDesignTextField footerText = new JRDesignTextField();
        footerText.setX(0);
        footerText.setY(0);
        footerText.setWidth(555);
        footerText.setHeight(20);
        footerText.setExpression(new JRDesignExpression("\"Created by: \" + $P{createdBy}"));
        footerText.setHorizontalTextAlign(HorizontalTextAlignEnum.RIGHT);
        footerText.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        footerText.setFontSize(10f);
        footerText.setForecolor(Color.DARK_GRAY);

        footerBand.addElement(footerText);
        jasperDesign.setPageFooter(footerBand);

        // 7️⃣ Parameter
        JRDesignParameter createdByParam = new JRDesignParameter();
        createdByParam.setName("createdBy");
        createdByParam.setValueClass(String.class);
        jasperDesign.addParameter(createdByParam);

        // 8️⃣ Compile
        JasperReport jasperReport = JasperCompileManager.compileReport(jasperDesign);

        // 9️⃣ Fill data
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(users);
        Map<String, Object> params = new HashMap<>();
        params.put("createdBy", "Admin");

        return JasperFillManager.fillReport(jasperReport, params, dataSource);
    }

    // ==================== HELPER ====================

    private JRDesignStaticText createHeaderCell(String text, int x, int width) {
        JRDesignStaticText header = new JRDesignStaticText();
        header.setX(x);
        header.setY(0);
        header.setWidth(width);
        header.setHeight(25);
        header.setText(text);
        header.setHorizontalTextAlign(HorizontalTextAlignEnum.CENTER);
        header.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        header.setFontSize(12f);
        header.setBold(true);
        header.setForecolor(Color.BLACK);
        header.setBackcolor(new Color(224, 235, 255)); // xanh nhạt dễ nhìn
        header.setMode(ModeEnum.OPAQUE);

        header.getLineBox().getPen().setLineWidth(0.5f);
        header.getLineBox().getPen().setLineStyle(LineStyleEnum.SOLID);
        header.getLineBox().getPen().setLineColor(Color.GRAY);
        return header;
    }

    private JRDesignTextField createDetailCell(String expression, int x, int width, HorizontalTextAlignEnum align) {
        JRDesignTextField field = new JRDesignTextField();
        field.setX(x);
        field.setY(0);
        field.setWidth(width);
        field.setHeight(20);
        field.setExpression(new JRDesignExpression(expression));
        field.setHorizontalTextAlign(align);
        field.setVerticalTextAlign(VerticalTextAlignEnum.MIDDLE);
        field.setFontSize(11f);
        field.setStretchWithOverflow(true);

        field.getLineBox().getPen().setLineWidth(0.25f);
        field.getLineBox().getPen().setLineStyle(LineStyleEnum.SOLID);
        field.getLineBox().getPen().setLineColor(new Color(200, 200, 200));

        return field;
    }
}
