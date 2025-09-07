# BidApp - Online Bidding Platform

A modern, responsive online bidding platform built with Next.js 14, TypeScript, and Tailwind CSS. Perfect for local businesses to create and manage auctions.

## Features

- 🏠 **Home Page** - Welcome page with feature highlights
- 🛒 **Auctions Page** - Browse active auctions with real-time bid information
- ➕ **Create Auction** - Form to create new auctions with detailed item information
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Clean, professional design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Next.js 14 for optimal performance

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Inter (Google Fonts)
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bidapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Project Structure

```
bidapp/
├── app/                    # Next.js App Router directory
│   ├── auctions/          # Auctions page
│   ├── create/            # Create auction page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## Pages Overview

### Home Page (`/`)
- Welcome message and app introduction
- Feature highlights with icons
- Call-to-action buttons to browse auctions or create new ones


### Create Auction Page (`/create`)
- Comprehensive form for creating new auctions
- Fields include:
  - Item title and description
  - Category selection
  - Starting bid amount
  - End date and time
- Form validation and state management

## Customization

### Styling
The app uses Tailwind CSS for styling. You can customize the design by:
- Modifying `tailwind.config.js` for theme customization
- Updating `app/globals.css` for global styles
- Changing component classes in the React components

### Adding New Pages
1. Create a new directory in the `app/` folder
2. Add a `page.tsx` file with your component
3. Update the navigation in `app/layout.tsx` if needed

## Future Enhancements

- User authentication and profiles
- Real-time bidding with WebSockets
- Payment integration
- Image upload for auction items
- Search and filtering functionality
- Email notifications
- Admin dashboard
- Database integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you have any questions or need help, please open an issue in the repository.

