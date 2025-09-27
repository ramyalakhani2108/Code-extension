# 🚀 Publishing Guide for Todo Task Reminder Extension

## Prerequisites

1. **VS Code Account**: Create a free account at [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. **Publisher Account**: Create a publisher profile (we've set it to `greatstackdev`)
3. **Personal Access Token (PAT)**: Generate from Azure DevOps

## Step-by-Step Publishing Process

### 1. Create Publisher Account

1. Go to [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
2. Sign in with your Microsoft account
3. Click "Publish Extensions" → "Create Publisher"
4. Set Publisher ID: `greatstackdev`
5. Fill in your details and verify

### 2. Generate Personal Access Token

1. Go to [Azure DevOps Personal Access Tokens](https://dev.azure.com/YOUR_ORG/_usersSettings/tokens)
   - **Organization**: `vscode` (not your org)
   - **Name**: `VSCode Extension Publishing`
2. **Scopes**: Check `Marketplace` → `Manage`
3. **Expiration**: Set to 1 year or custom
4. **Copy the token** (save it securely!)

### 3. Login to VSCE

Choose one method:

**Method A: Interactive Login**
```bash
vsce login greatstackdev
# Follow prompts to enter your PAT
```

**Method B: Environment Variable**
```bash
export VSCE_PAT=your_actual_token_here
```

### 4. Test Packaging

```bash
npm run package
# or
vsce package --no-dependencies
```

### 5. Publish Your Extension

**Option A: Use the automated script**
```bash
./publish.sh
```

**Option B: Manual publishing**
```bash
# Package
vsce package --no-dependencies

# Publish
vsce publish --no-dependencies
```

## 📊 Post-Publishing

### Check Your Extension
- **Marketplace**: https://marketplace.visualstudio.com/items?itemName=greatstackdev.todo-task-reminder
- **Publisher Dashboard**: https://marketplace.visualstudio.com/manage/publishers/greatstackdev

### Update Process
When releasing updates:

1. **Increment version** in `package.json` (follow [semantic versioning](https://semver.org/))
2. **Test thoroughly** in Extension Development Host (F5)
3. **Update CHANGELOG.md** with new features
4. **Run**: `./publish.sh`

### Version Number Guidelines
- **Patch** (`0.0.1` → `0.0.2`): Bug fixes
- **Minor** (`0.0.1` → `0.1.0`): New features
- **Major** (`0.0.1` → `1.0.0`): Breaking changes

## 🐛 Troubleshooting

### Common Issues

**"Publisher not found"**
- Verify publisher name in package.json matches your account
- Check PAT has correct scopes

**"Version already exists"**
- Increment version number in package.json

**"Extension size too large"**
- Check .vscodeignore excludes unnecessary files
- Optimize webpack bundle

**"Login failed"**
- Verify PAT is correct and not expired
- Try `vsce logout` then `vsce login` again

### Debug Commands

```bash
# Check login status
vsce verify-pat

# List your extensions
vsce list greatstackdev

# Show package contents
vsce show greatstackdev.todo-task-reminder
```

## 📈 Marketing Your Extension

1. **GitHub README**: Keep it updated with features and screenshots
2. **Social Media**: Share on Twitter, LinkedIn, Reddit (r/vscode)
3. **VS Code Forums**: Post in VS Code discussions
4. **Screenshots**: Add high-quality images to README
5. **Demo Video**: Create a short video showing features

## 🔧 Maintenance

- **Monitor Issues**: Check GitHub issues regularly
- **User Feedback**: Read reviews and respond
- **Regular Updates**: Release improvements frequently
- **Security**: Keep dependencies updated

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/GreatStackDev/QuickCart/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Check your publisher account email

---

🎉 **Congratulations on publishing your first VS Code extension!**

Your extension is now available to millions of developers worldwide. Keep improving it based on user feedback and enjoy the journey of building developer tools!