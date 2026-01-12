package net.engineeringdigest.journalApp.component;

import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")


public class PublicController {
    @Autowired
    private UserService userService;

    @GetMapping("/healthCheck")
    public String healthCheck() {
        return "okk tested!";
    }

    @PostMapping("/create_user")
    public void createUser(@RequestBody User user) {
        userService.saveNewUser(user);
    }
}