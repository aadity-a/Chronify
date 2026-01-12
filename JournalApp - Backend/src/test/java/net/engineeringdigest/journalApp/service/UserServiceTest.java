package net.engineeringdigest.journalApp.service;


import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class UserServiceTest {
    @Autowired
    private UserService userService;

    @ParameterizedTest
    @CsvSource({
            "aadi",
            "dev",
            "anant"
    })
    public void testFindByUserName(String name) {
        assertEquals(3,1+2);
        assertNotNull(userService.findByUserName(name),"failed for : " + name);
    }

    @Test
    @Disabled
    public void test(){
        assertTrue(5<6);
    }
}
