# 🚀 Quick Start Guide

## Installation Steps

### 1. Extract the Project
```bash
# Extract the ZIP file to your desired location
unzip instagram-dashboard.zip
cd instagram-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- Tailwind CSS
- Lucide React (icons)
- Recharts (data visualization)
- Framer Motion (animations)

### 3. Start Development Server
```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### 4. Login to the Dashboard
- Default landing page is the Authentication page
- Use any email and password (e.g., `demo@instahub.com` / `password123`)
- Or click any social login button (Instagram, Facebook, Google)
- Authentication is mock/frontend-only for demo purposes

## 📱 Navigation Guide

Once logged in, you'll see the sidebar with 4 main sections:

### 1. Dashboard (Default after login)
- View analytics and statistics
- Monitor webhook events
- Access quick actions
- Check system status

### 2. Messages
- Chat interface with WhatsApp-style UI
- Select conversations from the left panel
- Send messages, files, and voice notes
- See typing indicators and read receipts

### 3. Admin Panel
- Configure API keys
- Set up webhooks
- Toggle automation features
- Manage uploaded files
- Adjust system settings

## 🎨 Key Features to Try

### Chat Interface
1. Click on different users in the chat list
2. Try sending a message
3. Notice the typing indicator animation
4. Check the read receipts (single/double ticks)
5. Use the quick reply templates at the bottom
6. Toggle between Instagram and WhatsApp conversations

### Admin Panel
1. Toggle the automation switches
2. Try showing/hiding API keys with the eye icon
3. Copy API keys with the copy button
4. Upload a file using the "Upload Files" button
5. Adjust the automation settings
6. Click "Save All Changes" to see the success notification

### Dashboard
1. View the interactive charts
2. Scroll through webhook events
3. Click on quick action buttons
4. Monitor real-time statistics

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#0ea5e9', // Change this to your brand color
    // ...
  }
}
```

### Change Fonts
Update in `styles/globals.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@400;600;700&display=swap');
```

Then update `tailwind.config.js`:
```js
fontFamily: {
  sans: ['YourFont', 'sans-serif']
}
```

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is busy, start on a different port:
```bash
PORT=3001 npm run dev
```

### Dependencies Not Installing
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### Styles Not Loading
Restart the development server:
```bash
# Stop with Ctrl+C, then restart
npm run dev
```

## 📱 Mobile Testing

The dashboard is fully responsive. To test on mobile:
1. Start the dev server
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Access from mobile: `http://YOUR_IP:3000`

## 🌟 Next Steps

### Add Real API Integration
1. Create an API route in `app/api/`
2. Add environment variables in `.env.local`
3. Update the mock data with real API calls

### Add Database
1. Install Prisma or your preferred ORM
2. Set up database schema
3. Connect to authentication system

### Deploy to Production
Popular options:
- **Vercel** (recommended for Next.js): https://vercel.com
- **Netlify**: https://netlify.com
- **AWS/Azure/GCP**: Traditional cloud providers

## 💡 Tips

- The sidebar collapses on mobile - use the menu icon to toggle
- All forms have validation - try submitting empty forms
- Charts are interactive - hover to see details
- The admin panel has copy-to-clipboard for API keys
- Use keyboard shortcuts: Enter to send messages

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Recharts](https://recharts.org)

---

**Need help?** Check the README.md for detailed documentation.
