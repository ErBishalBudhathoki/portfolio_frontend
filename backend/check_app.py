try:
    from app.main import app
    print("Successfully imported app.main")
    
    # Check other imports
    from app.linkedin_sheet import ensure_linkedin_sheet_exists
    print("LinkedIn sheet import successful")
    
    from app.contact_form import ensure_contact_sheet_exists
    print("Contact form import successful")
    
except Exception as e:
    print(f"Error importing app: {e}")
    import traceback
    traceback.print_exc() 