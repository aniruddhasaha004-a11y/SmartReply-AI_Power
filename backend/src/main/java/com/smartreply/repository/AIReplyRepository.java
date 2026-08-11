package com.smartreply.repository;

import com.smartreply.model.AIReply;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIReplyRepository extends MongoRepository<AIReply, String> {
    List<AIReply> findByUserIdOrderByCreatedAtDesc(String userId);
}
