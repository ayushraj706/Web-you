# InstaHub - Instagram & WhatsApp API Dashboard

A professional, production-ready dashboard for managing Instagram and WhatsApp API integrations with advanced chat UI, analytics, and admin controls.

## 🚀 Features

### 1. **Central Hub Navigation**
- Sleek sidebar with icon-based navigation
- Seamless page transitions
- Mobile-responsive with collapsible sidebar
- User profile management

### 2. **Authentication Page**
- Modern login/signup interface
- Social authentication (Instagram, Facebook, Google)
- Password visibility toggle
- Form validation with error states
- Forgot password functionality

### 3. **Analytics Dashboard**
- Real-time statistics cards (Messages, Sessions, Auto-Replies, Response Rate)
- Interactive charts (Message activity, Engagement over time)
- Live webhook event feed
- Quick action buttons
- Platform status indicators

### 4. **Advanced Chat UI**
- WhatsApp-style interface
- Dual-pane layout (Chat list + Message window)
- Real-time typing indicators
- Message read receipts (single/double ticks)
- Online status indicators
- Source platform badges (Instagram/WhatsApp)
- Rich message input with emoji picker
- File and image attachment buttons
- Voice message support
- Quick reply templates
- Search functionality

### 5. **Admin Control Panel**
- System status dashboard
- API key management (Instagram & WhatsApp)
- Webhook configuration
- Automation controls (Auto-reply, Analytics, Encryption)
- Rate limiting settings
- File upload and management
- Security logs access

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Setup

1. **Extract the ZIP file**
```bash
unzip instagram-dashboard.zip
cd instagram-dashboard
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design Features

- **Modern UI/UX**: Clean, professional interface inspired by Meta's business portals
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Fade-in, slide-up, and scale-in transitions
- **Custom Color Palette**: Primary blues, accent purples/pinks, with dark mode support
- **Iconography**: Lucide React icons throughout
- **Interactive Charts**: Recharts for data visualization
- **Glass Morphism Effects**: Modern glassmorphic UI elements

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📂 Project Structure

```
instagram-dashboard/
├── app/
│   ├── components/
│   │   ├── AuthPage.jsx        # Login/Signup page
│   │   ├── DashboardPage.jsx   # Analytics dashboard
│   │   ├── ChatPage.jsx        # Chat interface
│   │   └── AdminPage.jsx       # Admin panel
│   ├── layout.jsx              # Root layout
│   └── page.jsx                # Central Hub (Main App)
├── styles/
│   └── globals.css             # Global styles & CSS variables
├── public/                      # Static assets
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── README.md                   # This file
```

## 🎯 Usage

### Authentication
1. Navigate to the Authentication page (default landing page)
2. Login with any email/password (mock authentication)
3. Or use social login buttons (Instagram, Facebook, Google)

### Dashboard
- View real-time statistics
- Monitor webhook events
- Access quick actions
- Check platform status

### Chat Interface
- Select a conversation from the left sidebar
- View chat history with timestamps and read receipts
- Send messages with the input field
- Use quick reply templates
- Attach files or images
- Record voice messages

### Admin Panel
- Configure API keys (Instagram & WhatsApp)
- Set up webhook URLs and secrets
- Toggle automation features
- Adjust rate limiting
- Upload and manage files
- Save all changes

## 🔐 Security Notes

This is a **demo/frontend-only** application. In production:
- Store API keys securely in environment variables
- Implement proper backend authentication
- Use HTTPS for all API communications
- Validate and sanitize all user inputs
- Implement proper CORS policies
- Add rate limiting on the backend

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```js
colors: {
  primary: { ... },  // Main brand color
  accent: { ... },   // Accent colors
  dark: { ... }      // Dark theme colors
}
```

### Fonts
Update font families in `tailwind.config.js`:
```js
fontFamily: {
  sans: ['Your Font', 'sans-serif'],
  display: ['Display Font', 'sans-serif']
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🐛 Known Limitations

- Mock data for demonstration (no real API integration)
- Authentication is frontend-only (no backend)
- File uploads are simulated
- Charts use static data

## 🚀 Production Build

To create a production build:

```bash
npm run build
npm start
```

## 📄 License

This project is provided as-is for demonstration and development purposes.

## 💡 Tips

- Use the "Forgot Password" link for UI demonstration
- Try toggling automation switches in the Admin Panel
- Test the chat interface with different users
- Explore the responsive design on mobile devices

## 🤝 Support

For questions or issues, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
