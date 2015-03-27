#!/usr/bin/env ruby
require "rubygems"
require "edn"
require "bigdecimal"
require "date"
require "optparse"

debug = false
OptionParser.new do |opts|
  opts.banner = "Usage: runner.rb [options]"
  opts.on("-d", "--debug", "debug") { debug = true} 
end.parse!

validEdnDir = "../../../../valid-edn"
results = {}
Dir.entries(validEdnDir).select {|f| !File.directory? f}.map { |ednFile| 
  ednFileName = ednFile.split(".").first
  validEdn = IO.read "#{validEdnDir}/#{ednFileName}.edn" 
  expectedRb = IO.read "../#{ednFileName}.rb"
  puts ednFileName if debug
  begin 
    expected = eval expectedRb
    parsed = EDN.read validEdn
    result = expected == parsed
    if (not result) and debug
      puts "Values did not match", "\tEXPECTED: #{expected.to_edn}", "\tPARSED: #{parsed.to_edn}"
    end 
   results[ednFile] = result
  rescue Exception => e
    results[ednFile] = false
    puts "\tFailed to parse <<#{validEdn}>> with: #{e}" if debug
  end
}

puts results.to_edn
