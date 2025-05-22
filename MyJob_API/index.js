require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/db.config");
const defineAssociations = require("./models/associations.model");
const path = require("path");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 6011;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/photo', express.static(path.join(__dirname, './uploads/companyLogos')));
app.use('/api/v1/userlogo', express.static(path.join(__dirname, './uploads/userLogos')));

app
  .get("/", (req, res) => {
   return res.status(200).sendFile(path.join(__dirname, 'public/templates', 'index.html'));
  })
  .post("/", (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, 'public/templates', 'index.html'));
  });


app.use("/api/v1/personalDetails", require("./routes/PersonalDetails.routes"));
app.use("/api/v1/educational", require("./routes/userEducationDetails.routes"));
app.use("/api/v1/professionalDetails", require("./routes/ProfessionalDetails.routes"));
app.use("/api/v1/requestApplication", require("./routes/RequestApplication.routes"));
app.use("/api/v1/organizationDetails", require("./routes/OrganizationDetails.routes"));
app.use("/api/v1/postedjob", require("./routes/PostedJob.routes"));
app.use("/api/v1/SavedJob", require("./routes/SavedJob.routes"));
app.use('/api/v1/skillDetails', require("./routes/Skill.routes"));
app.use('/api/v1/sectorDetails', require("./routes/Sector.routes"));
app.use('/api/v1/designation', require("./routes/Designation.routes"));
app.use('/api/v1/event', require("./routes/event.routes"));
app.use('/api/v1/admin', require("./routes/Admin.routes"));


const initiateConnection = async () => {
  try {
    defineAssociations();
    await sequelize.authenticate()
    await sequelize.sync({ alter: true })
    // await sequelize.sync({ force: true })
    .then(() => {
      console.log("Connection has been established successfully.");
      server.listen(PORT, () => {
        console.log(`Server started on port http://localhost:${PORT}`);
      });
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

initiateConnection();

