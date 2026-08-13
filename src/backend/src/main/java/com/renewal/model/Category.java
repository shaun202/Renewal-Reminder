package backend.src;

/**
 * Category class
 * 
 * @author Shaun
 * @version 1.0
 * @since 12/8/2026
 */
public class Category {
    private String id;
    private String name;
    private String icon;
    private boolean builtin;

    // Default constructor for more flexibility in creating a Cetegory object
    public Category(){
    }

    // Constructor for creating personnlised category
    public Category(String id, String name, String icon, boolean builtin){
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.builtin = builtin;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isBuiltin() {
        return builtin;
    }

    public void setBuiltin(boolean builtin) {
        this.builtin = builtin;
    }
}
