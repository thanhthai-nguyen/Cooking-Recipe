const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
dotenv.config({ path: "./.env" });


// CONNECT DATABASE
connectDB();

// SETTING PORT AND LISTEN SEVER
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT} with environment ${process.env.NODE_ENV}`
    );
});