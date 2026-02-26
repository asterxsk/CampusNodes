# Development Prompts

Profile and Theme Settings

    Add a 3-dots (kebab) menu attached to the user profile icon.

    Move the "Edit Profile" and "Change Password" actions into this new menu.

    Introduce a "Switch Theme" option within the menu.

    Implement four theme states: Dark (Default), Catppuccin Mocha, Light, and Catppuccin Latte.

Admin Authentication and Access

    Configure an admin login state (Username: admin, Password: campusadmin404). Note: For production, it is safer to store these credentials in environment variables rather than hardcoding them in the application.

    Render an "Admin Console" button fixed to the bottom-left of the screen, visible only upon successful admin authentication.

Admin Console: User Management

    Provide controls to completely remove specific users from the platform and the database.

    Allow editing of user details, including modifying display names and removing profile pictures.

    Manage user networks by deleting friendships or connections.

    Delete user-generated content and posts.

Admin Console: Platform Communications

    Add testing tools to send test messages to specific users.

    Messages sent via the admin console must display the sender name as "CampusNodes" accompanied by a blue verified checkmark.

Admin Console: Marketplace and Services

    Provide an action to clear or delete all existing posts and services.

    Build an admin form to create new marketplace items or services.

    Form fields must include: Name, Price, Description, Category, and an Image Upload component.

    Submit the form to publish the new items directly to the site's marketplace/service board.

Additional Notes

    Let me know if I need to make a new bucket on supabase.
    
    The verified badge and marketplace, services need database edit, let me know if i need to make a new table for that.
