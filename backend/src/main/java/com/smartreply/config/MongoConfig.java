package com.smartreply.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // Custom MongoDB configurations (converters, transaction managers, etc.) can be declared here.
}
