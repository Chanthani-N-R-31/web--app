# 🚀 How to Run the Interactive Python Learning Web App

## ⚠️ Important: Don't Double-Click HTML Files!

**The app must be run through the Flask server, not by opening HTML files directly.**

## 🎯 Correct Way to Run the App

### **Method 1: Using the Startup Script (Recommended)**

**For Windows:**
1. Double-click `start.bat` file
2. Wait for the server to start
3. Open your browser and go to: http://localhost:5000

**For Mac/Linux:**
1. Open terminal in the project folder
2. Run: `bash start.sh`
3. Open your browser and go to: http://localhost:5000

### **Method 2: Manual Startup**

1. **Open Command Prompt/Terminal** in the project folder
2. **Install dependencies** (first time only):
   ```bash
   pip install flask flask-cors
   ```
3. **Start the server**:
   ```bash
   python app_simple.py
   ```
4. **Open your browser** and navigate to: http://localhost:5000

### **Method 3: Using the Main Runner**

1. **Open Command Prompt/Terminal** in the project folder
2. **Run**:
   ```bash
   python run.py
   ```
3. **Open your browser** and navigate to: http://localhost:5000

## ✅ How to Know It's Working

When the server starts correctly, you should see:
```
🐍 Interactive Python Learning Web App (Simplified)
==================================================
🌐 Server starting on http://localhost:5000
🚀 Ready to start learning Python!
   Open your browser and navigate to the URL above
   Press Ctrl+C to stop the server
```

## 🌐 Accessing the App

**✅ Correct URL:** http://localhost:5000
**❌ Wrong:** Opening HTML files directly (file:///...)

### **Available Pages:**
- **Home:** http://localhost:5000
- **Mode 1:** http://localhost:5000/mode1
- **Mode 2:** http://localhost:5000/mode2

## 🔧 Troubleshooting

### **Problem: "This site can't be reached"**
**Solution:** Make sure the Flask server is running first

### **Problem: "Port already in use"**
**Solution:** 
1. Close any other instances of the app
2. Or change the port in the code

### **Problem: "Module not found"**
**Solution:** Install dependencies:
```bash
pip install flask flask-cors
```

### **Problem: Static files not loading**
**Solution:** Make sure you're accessing via http://localhost:5000, not file://

## 🎮 Testing the Features

Once the app is running at http://localhost:5000:

### **1. Test Mode 1 (Problem to Code):**
- Go to Mode 1
- Enter: "Write a program to check if a number is even or odd"
- Click "Generate Flowchart"
- Write code and run it

### **2. Test Mode 2 (Code Analysis):**
- Go to Mode 2
- Paste some Python code
- Click "Analyze Code"
- See the flowchart and error analysis

### **3. Test Chatbot Error Detection:**
- Click the chat icon (💬)
- Paste: "SyntaxError: invalid syntax"
- Get intelligent error help!

## 🛑 Common Mistakes to Avoid

1. **❌ Don't double-click HTML files** - They won't work properly
2. **❌ Don't open file:// URLs** - Use http://localhost:5000
3. **❌ Don't forget to start the server** - The app needs Flask running
4. **❌ Don't use different ports** - Stick to 5000 unless changed in code

## 🎯 Quick Start Checklist

- [ ] Open terminal/command prompt in project folder
- [ ] Run `python app_simple.py`
- [ ] See server startup message
- [ ] Open browser to http://localhost:5000
- [ ] Test the features!

---

## 🆘 Still Having Issues?

If you're still having problems:

1. **Check if Python is installed:** `python --version`
2. **Check if Flask is installed:** `pip list | grep -i flask`
3. **Make sure you're in the right folder:** Look for `app_simple.py`
4. **Try the test script:** `python test_chatbot.py`

**Remember: The app is a web application that needs a server to run properly!** 🌐
