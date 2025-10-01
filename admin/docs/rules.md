# Collaboration Rules and Guidelines

**Last Updated**: 2025-09-12  
**Purpose**: Central guidelines for AI collaboration and project development  
**Status**: Active - Reference for all project interactions

## 🎯 **Core Collaboration Principles**

### **File Management**
- **One file or chunk at a time** except for planning and documentation purposes
- **Always consider markdown files** for communicating topics related to planning/design
- **Maintain organized documentation** structure with clear hierarchies
- **Create backups** before major structural changes
- **Update references** when moving or renaming files

### **Project Structure Guidelines**
- **`admin/`** - Project management, planning, and collaboration
- **`docs/`** - Codebase documentation and learning materials
- **`backend/`** - Application code and implementation
- **Root level** - Essential project files (README, requirements, etc.)

### **Documentation Standards**
- **Use markdown** for all documentation files
- **Include README.md** in each major directory
- **Provide clear navigation** between related documents
- **Maintain consistent formatting** across all files
- **Update references** when restructuring

## 🤖 **AI Assistant Guidelines**

### **Code Changes**
- **Edit existing files** rather than creating new ones when possible
- **Make incremental changes** with clear explanations
- **Test changes** before proceeding to next steps
- **Document modifications** in appropriate files

### **Testing Before Implementation**
- **Test existing functionality** before adding new features
- **Verify API endpoints** work correctly before frontend integration
- **Test with real data** (not just mock data) when possible
- **Use Docker containers** for consistent testing environment
- **Test edge cases** and error scenarios
- **Verify UI components** work with actual backend responses
- **Test search/filter combinations** to ensure they work together
- **Validate sorting** with different data types and edge cases

### **Project Management**
- **Follow the roadmap** and ADRs for strategic decisions
- **Update progress documentation** after major milestones
- **Maintain context** across conversation sessions
- **Reference specific folders** when working on large projects

### **User Interaction**
- **Ask for confirmation** before major structural changes
- **Explain reasoning** behind recommendations
- **Provide clear options** when multiple approaches exist
- **Respect user preferences** and learning objectives
- **Provide commands for user to run** instead of running npm/servers directly
- **Let user handle all server startup** and npm commands

### **Collaborative Problem Solving**
- **Ask user to help** when encountering issues instead of debugging alone
- **Request status checks** - "Are you still running the backend? Can you check if it's responding?"
- **Ask for user to test** - "Can you try running this command and let me know what happens?"
- **Request user to restart services** - "The API seems down, can you restart the backend for me?"
- **Ask for error details** - "What error are you seeing? Can you share the terminal output?"
- **Request user to check logs** - "Can you check the backend logs and tell me what's happening?"
- **Don't assume** - Always ask "Is X still running?" before troubleshooting

### **Terminal Command Limitations (Temporary Fix)**
- **Avoid running npm commands** - User will handle all npm install, npm run dev, etc.
- **Avoid running server commands** - User will start/stop Flask, React dev servers
- **Focus on file operations** - Reading, editing, creating files works well
- **Use simple commands** - Basic file operations, directory listing, etc.
- **Provide clear instructions** - Give user exact commands to run when needed
- **Work around limitations** - Use file operations and provide user with commands to execute

## 📋 **Development Workflow**

### **Planning Phase**
1. **Review existing documentation** and ADRs
2. **Identify requirements** and constraints
3. **Propose solutions** with clear trade-offs
4. **Get user approval** before implementation

### **Implementation Phase**
1. **Test existing functionality** before making changes
2. **Make incremental changes** with clear explanations
3. **Test functionality** after each change
4. **Update documentation** to reflect changes
5. **Maintain project structure** and organization

### **Feature Testing Workflow**
1. **Backend Testing First**
   - Test API endpoints with curl or Postman
   - Verify data structure and response format
   - Test edge cases and error scenarios
   - Ensure proper sorting, filtering, and pagination

2. **Frontend Integration Testing**
   - Test with real API data (not mock data)
   - Verify UI components work with actual responses
   - Test user interactions and state management
   - Validate search/filter/sort combinations

3. **End-to-End Testing**
   - Test complete user workflows
   - Verify data flows correctly between frontend and backend
   - Test with different data sets and scenarios
   - Ensure consistent behavior across features

### **Documentation Phase**
1. **Update relevant documentation** files
2. **Create or update README** files as needed
3. **Ensure all references** are current and working
4. **Maintain clear navigation** between documents

## 🔄 **Project Evolution Guidelines**

### **When to Restructure**
- **Multiple similar files** in same directory
- **Deep nesting** that makes navigation difficult
- **Redundant documentation** across multiple files
- **User requests** for better organization

### **How to Restructure**
1. **Analyze current structure** and identify issues
2. **Propose consolidation plan** with clear benefits
3. **Create backups** before making changes
4. **Implement systematically** with user approval
5. **Update all references** to new locations

### **Maintaining Quality**
- **Keep core files** in logical locations
- **Preserve important content** during reorganization
- **Maintain clear navigation** between related documents
- **Update references** to ensure all links work

## 📚 **Documentation Hierarchy**

### **Strategic Level**
- **Roadmap** - High-level project phases
- **ADRs** - Architecture Decision Records
- **Rules** - This file (collaboration guidelines)

### **Planning Level**
- **Progress Documentation** - Current status and achievements
- **Database Planning** - Database design and migration
- **Planning Notes** - Brainstorming and considerations

### **Implementation Level**
- **Technical Guides** - Implementation details
- **Testing Documentation** - Testing strategies and results
- **Collaboration Logs** - Chat logs and decision history

### **Reference Level**
- **Syntax Guides** - Code explanations and learning
- **API Documentation** - Endpoint references
- **Setup Guides** - Environment and configuration

## 🚀 **Best Practices**

### **File Organization**
- **Group related files** in subdirectories
- **Use descriptive names** for files and directories
- **Maintain consistent structure** across similar directories
- **Create clear entry points** (README files)

### **Content Management**
- **Keep content current** and relevant
- **Remove outdated information** when updating
- **Cross-reference related documents** appropriately
- **Maintain clear separation** between different types of content

### **Collaboration**
- **Respect user preferences** and learning style
- **Provide clear explanations** for technical decisions
- **Maintain project momentum** while ensuring quality
- **Document decisions** and reasoning for future reference

## 📝 **Change Log**

### **2025-09-12**
- **Initial comprehensive rules** created
- **Expanded from basic guidelines** to full collaboration framework
- **Added project structure guidelines** and documentation standards
- **Included AI assistant guidelines** and development workflow
- **Established documentation hierarchy** and best practices

---

**This file serves as the central reference for all project collaboration and should be consulted for any structural or process decisions.**